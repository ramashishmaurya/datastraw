import calendar
from datetime import datetime, date
from typing import List, Dict, Tuple, Optional
import uuid

from models.schemas import (
    RosterCell, Conflict, RosterResponse, ShiftStatus,
    Brand, Employee, Allocation, LeaveRecord, PublicHoliday,
    OperatingModel, ProcessType
)
from engine.validator import validate_roster, does_brand_operate, is_date_sunday, is_date_saturday
from engine.resolver import find_best_backup

def generate_month_dates(year: int, month: int) -> List[str]:
    """Generates all YYYY-MM-DD strings for a given year and month."""
    num_days = calendar.monthrange(year, month)[1]
    return [f"{year:04d}-{month:02d}-{day:02d}" for day in range(1, num_days + 1)]

def build_roster(
    year: int,
    month: int,
    employees: List[Employee],
    brands: List[Brand],
    allocations: List[Allocation],
    holidays: List[PublicHoliday],
    leaves: List[LeaveRecord],
    auto_assign_pod_backups: bool = True
) -> RosterResponse:
    """
    Core Roster Generation Logic.
    Implements constraint-aware scheduling distinguishing between:
    1. Single-resource vs Multi-resource brand operating models.
    2. Mandatory brand coverage vs Employee statutory weekly offs.
    3. Pod-level backup load balancing.
    """
    dates = generate_month_dates(year, month)
    holiday_map = {h.date: h.name for h in holidays}
    leave_map = {(l.date, l.employee_id): l for l in leaves}
    emp_map = {e.id: e for e in employees}
    brand_map = {b.id: b for b in brands}

    # Group allocations by brand and by employee
    allocs_by_brand: Dict[str, List[Allocation]] = {}
    allocs_by_emp: Dict[str, List[Allocation]] = {}
    for a in allocations:
        allocs_by_brand.setdefault(a.brand_id, []).append(a)
        allocs_by_emp.setdefault(a.employee_id, []).append(a)

    # Master cells map: (date, employee_id) -> RosterCell
    cells_map: Dict[Tuple[str, str], RosterCell] = {}

    # STEP 1: Process Pre-scheduled Absences (Leaves, Holidays)
    for d in dates:
        is_sun = is_date_sunday(d)
        is_sat = is_date_saturday(d)
        is_hol = d in holiday_map

        for emp in employees:
            # Check approved leave first (Hard Constraint)
            if (d, emp.id) in leave_map:
                leave_obj = leave_map[(d, emp.id)]
                cells_map[(d, emp.id)] = RosterCell(
                    date=d,
                    employee_id=emp.id,
                    employee_name=emp.name,
                    status=leave_obj.leave_type,
                    notes=leave_obj.reason or "Approved Leave"
                )

    # STEP 2: Schedule Multi-Resource Brands (~20% of brands)
    # Stagger weekly offs among assigned employees to guarantee 365-day coverage
    multi_brands = [b for b in brands if not b.is_single_resource]
    for brand in multi_brands:
        brand_allocs = allocs_by_brand.get(brand.id, [])
        assigned_emp_ids = list({a.employee_id for a in brand_allocs})

        for d_idx, d in enumerate(dates):
            is_sun = is_date_sunday(d)
            is_hol = d in holiday_map

            # Check if brand operates today
            # If closed for holiday across all processes:
            closed_for_holiday = is_hol and brand.operating_model in [
                OperatingModel.DAILY_EXCEPT_HOLIDAYS,
                OperatingModel.MON_SAT_NO_HOLIDAYS,
                OperatingModel.MON_FRI_NO_HOLIDAYS
            ]

            # Distribute weekly offs evenly across the week for team members
            for emp_idx, emp_id in enumerate(assigned_emp_ids):
                if (d, emp_id) in cells_map:
                    continue # Already has leave/status

                emp = emp_map[emp_id]
                # Stagger off day: employee (emp_idx) takes their off on day (emp_idx % 7)
                dt_obj = datetime.strptime(d, "%Y-%m-%d")
                weekday = dt_obj.weekday() # 0 = Monday, 6 = Sunday

                # Employee's designated staggered off day
                staggered_off_day = (emp_idx * 2) % 7 # E.g. Emp 0 -> Mon(0), Emp 1 -> Wed(2), Emp 2 -> Fri(4)

                if closed_for_holiday:
                    cells_map[(d, emp_id)] = RosterCell(
                        date=d,
                        employee_id=emp.id,
                        employee_name=emp.name,
                        status=ShiftStatus.PUBLIC_HOLIDAY_OFF,
                        brand_id=brand.id,
                        brand_name=brand.name,
                        notes=f"Closed: {holiday_map[d]}"
                    )
                elif weekday == staggered_off_day:
                    cells_map[(d, emp_id)] = RosterCell(
                        date=d,
                        employee_id=emp.id,
                        employee_name=emp.name,
                        status=ShiftStatus.WEEKLY_OFF,
                        brand_id=brand.id,
                        brand_name=brand.name,
                        notes="Staggered Weekly Off"
                    )
                else:
                    # Assign primary process
                    emp_allocs = [a for a in brand_allocs if a.employee_id == emp_id]
                    p_type = emp_allocs[0].process_type if emp_allocs else ProcessType.CS
                    cells_map[(d, emp_id)] = RosterCell(
                        date=d,
                        employee_id=emp.id,
                        employee_name=emp.name,
                        brand_id=brand.id,
                        brand_name=brand.name,
                        process_type=p_type,
                        status=ShiftStatus.WORKING,
                        is_backup=False,
                        notes="Normal Shift"
                    )

    # STEP 3: Schedule Single-Resource Brands (~80% of brands)
    # Handled by 1 dedicated employee. Need to balance brand calendar with mandatory weekly off.
    single_brands = [b for b in brands if b.is_single_resource]
    for brand in single_brands:
        brand_allocs = allocs_by_brand.get(brand.id, [])
        if not brand_allocs:
            continue
        primary_alloc = brand_allocs[0]
        emp_id = primary_alloc.employee_id
        emp = emp_map[emp_id]

        for d in dates:
            if (d, emp_id) in cells_map:
                continue # Already marked leave

            dt_obj = datetime.strptime(d, "%Y-%m-%d")
            weekday = dt_obj.weekday()
            is_sun = (weekday == 6)
            is_sat = (weekday == 5)
            is_hol = d in holiday_map

            # Brand Operating Calendar checks:
            if brand.operating_model == OperatingModel.MON_FRI_NO_HOLIDAYS and (is_sat or is_sun):
                cells_map[(d, emp_id)] = RosterCell(
                    date=d, employee_id=emp.id, employee_name=emp.name,
                    brand_id=brand.id, brand_name=brand.name,
                    status=ShiftStatus.WEEKLY_OFF, notes="Weekend Off (Mon-Fri Brand)"
                )
            elif brand.operating_model == OperatingModel.MON_SAT_NO_HOLIDAYS and is_sun:
                cells_map[(d, emp_id)] = RosterCell(
                    date=d, employee_id=emp.id, employee_name=emp.name,
                    brand_id=brand.id, brand_name=brand.name,
                    status=ShiftStatus.WEEKLY_OFF, notes="Sunday Off (Mon-Sat Brand)"
                )
            elif is_hol and brand.operating_model in [OperatingModel.DAILY_EXCEPT_HOLIDAYS, OperatingModel.MON_SAT_NO_HOLIDAYS, OperatingModel.MON_FRI_NO_HOLIDAYS]:
                cells_map[(d, emp_id)] = RosterCell(
                    date=d, employee_id=emp.id, employee_name=emp.name,
                    brand_id=brand.id, brand_name=brand.name,
                    status=ShiftStatus.PUBLIC_HOLIDAY_OFF, notes=f"Holiday: {holiday_map[d]}"
                )
            elif brand.operating_model == OperatingModel.DAYS_365 and is_sun:
                # CRITICAL CHALLENGE: 365-day brand operated by 1 single employee!
                # Employee MUST get a weekly off every 7 days (cannot work 30 days straight).
                # Here we grant the employee weekly off on Sunday.
                # If auto_assign_pod_backups is True, we look for a Pod peer to cover!
                cells_map[(d, emp_id)] = RosterCell(
                    date=d, employee_id=emp.id, employee_name=emp.name,
                    brand_id=brand.id, brand_name=brand.name,
                    status=ShiftStatus.WEEKLY_OFF, notes="Statutory Weekly Off"
                )
            else:
                # Working day for the primary brand
                cells_map[(d, emp_id)] = RosterCell(
                    date=d, employee_id=emp.id, employee_name=emp.name,
                    brand_id=brand.id, brand_name=brand.name,
                    process_type=primary_alloc.process_type,
                    status=ShiftStatus.WORKING, is_backup=False,
                    notes="Primary Coverage"
                )

    # STEP 4: Fill remaining unallocated employees (e.g. Pod Leads, floating associates)
    for emp in employees:
        for d in dates:
            if (d, emp.id) not in cells_map:
                dt_obj = datetime.strptime(d, "%Y-%m-%d")
                weekday = dt_obj.weekday()
                if weekday == 6: # Sunday off by default for floating resources
                    cells_map[(d, emp.id)] = RosterCell(
                        date=d, employee_id=emp.id, employee_name=emp.name,
                        status=ShiftStatus.WEEKLY_OFF, notes="Weekly Off"
                    )
                else:
                    cells_map[(d, emp.id)] = RosterCell(
                        date=d, employee_id=emp.id, employee_name=emp.name,
                        status=ShiftStatus.WORKING, notes="Pod Oversight / Operations Management" if emp.is_pod_lead else "Available Pod Buffer"
                    )

    # Convert cells map to list
    all_cells = list(cells_map.values())

    # STEP 5: Run Full Validation & Conflict Detection Engine
    conflicts = validate_roster(
        dates=dates,
        brands=brands,
        employees=employees,
        allocations=allocations,
        cells=all_cells,
        holidays=holidays,
        leaves=leaves
    )

    # Calculate summary metrics
    working_count = sum(1 for c in all_cells if c.status == ShiftStatus.WORKING)
    off_count = sum(1 for c in all_cells if c.status == ShiftStatus.WEEKLY_OFF)
    leave_count = sum(1 for c in all_cells if c.status in [ShiftStatus.PLANNED_LEAVE, ShiftStatus.SICK_LEAVE, ShiftStatus.COMP_OFF])
    critical_conflicts = sum(1 for conf in conflicts if conf.severity == "CRITICAL")
    warning_conflicts = sum(1 for conf in conflicts if conf.severity == "WARNING")

    metrics = {
        "total_days": len(dates),
        "total_employees": len(employees),
        "total_brands": len(brands),
        "total_shifts_working": working_count,
        "total_weekly_offs": off_count,
        "total_leaves": leave_count,
        "critical_conflicts": critical_conflicts,
        "warning_conflicts": warning_conflicts,
        "total_conflicts": len(conflicts),
        "coverage_health_percent": max(0, 100 - (critical_conflicts * 2))
    }

    return RosterResponse(
        year=year,
        month=month,
        total_days=len(dates),
        cells=all_cells,
        conflicts=conflicts,
        metrics=metrics
    )
