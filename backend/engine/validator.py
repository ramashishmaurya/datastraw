from datetime import datetime
from typing import List, Dict, Tuple
import uuid

from models.schemas import (
    RosterCell, Conflict, ConflictSeverity, ConflictType,
    Brand, Employee, ProcessRequirement, ProcessType, OperatingModel,
    ShiftStatus, PublicHoliday, LeaveRecord
)
from engine.resolver import find_best_backup

def is_date_sunday(date_str: str) -> bool:
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return dt.weekday() == 6 # 6 is Sunday in Python datetime

def is_date_saturday(date_str: str) -> bool:
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return dt.weekday() == 5

def does_brand_operate(
    date_str: str,
    brand: Brand,
    process_req: ProcessRequirement,
    holiday_dates: Dict[str, str]
) -> Tuple[bool, str]:
    """
    Evaluates whether a brand's process requires staffing on a given date.
    Returns (requires_coverage: bool, reason: str)
    """
    is_sunday = is_date_sunday(date_str)
    is_saturday = is_date_saturday(date_str)
    is_holiday = date_str in holiday_dates

    # Check Public Holiday rule
    if is_holiday and not process_req.operates_holidays:
        return False, f"Closed for Public Holiday: {holiday_dates[date_str]}"

    # Check Sunday rule
    if is_sunday and not process_req.operates_sundays:
        return False, "Closed on Sundays by operating policy"

    # Check Model-level rules
    if brand.operating_model == OperatingModel.MON_FRI_NO_HOLIDAYS and (is_saturday or is_sunday):
        return False, "Closed on Weekends (Mon-Fri policy)"

    if brand.operating_model == OperatingModel.MON_SAT_NO_HOLIDAYS and is_sunday:
        return False, "Closed on Sundays (Mon-Sat policy)"

    return True, "Active operations required"

def validate_roster(
    dates: List[str],
    brands: List[Brand],
    employees: List[Employee],
    allocations: list,
    cells: List[RosterCell],
    holidays: List[PublicHoliday],
    leaves: List[LeaveRecord]
) -> List[Conflict]:
    """
    Comprehensive multi-level conflict audit.
    Evaluates Brand SLA Coverage, Employee Fatigue, Overlaps, and Leave compliance.
    """
    conflicts: List[Conflict] = []
    holiday_map = {h.date: h.name for h in holidays}
    emp_map = {e.id: e for e in employees}
    brand_map = {b.id: b for b in brands}

    # Index cells by (date, emp_id) and (date, brand_id, process_type)
    cell_by_emp_date: Dict[Tuple[str, str], RosterCell] = {}
    working_by_brand_proc_date: Dict[Tuple[str, str, ProcessType], List[RosterCell]] = {}

    # Build allocation lookup: (emp_id, brand_id) -> list of process_types
    emp_brand_processes: Dict[Tuple[str, str], List[ProcessType]] = {}
    for a in allocations:
        emp_brand_processes.setdefault((a.employee_id, a.brand_id), []).append(a.process_type)

    for c in cells:
        cell_by_emp_date[(c.date, c.employee_id)] = c
        if c.status == ShiftStatus.WORKING and c.brand_id:
            # Determine which processes this employee covers today for this brand
            covered_procs = []
            if c.process_type:
                covered_procs.append(c.process_type)
            # Also include any allocated processes for this employee on this brand
            alloc_procs = emp_brand_processes.get((c.employee_id, c.brand_id), [])
            for p in alloc_procs:
                if p not in covered_procs:
                    covered_procs.append(p)

            for proc in covered_procs:
                key = (c.date, c.brand_id, proc)
                if key not in working_by_brand_proc_date:
                    working_by_brand_proc_date[key] = []
                working_by_brand_proc_date[key].append(c)

    # 1. Audit Brand & Process Coverage for Every Date
    for date_str in dates:
        for brand in brands:
            pod_employees = [e for e in employees if e.pod_id == brand.pod_id]
            for proc_req in brand.process_requirements:
                operates, reason = does_brand_operate(date_str, brand, proc_req, holiday_map)
                if not operates:
                    continue # Not operating on this day, no coverage needed

                key = (date_str, brand.id, proc_req.process_type)
                active_workers = working_by_brand_proc_date.get(key, [])
                active_count = len(active_workers)

                if active_count < proc_req.min_staff:
                    deficit = proc_req.min_staff - active_count
                    
                    # Identify assigned employees for this brand/process who are absent
                    assigned_emps = [
                        a.employee_id for a in allocations 
                        if a.brand_id == brand.id and a.process_type == proc_req.process_type
                    ]

                    # Search for recommended backup
                    backup_result = find_best_backup(
                        date=date_str,
                        brand=brand,
                        process=proc_req.process_type,
                        pod_employees=pod_employees,
                        current_cells=cell_by_emp_date,
                        all_allocations=allocations,
                        exclude_emp_ids=assigned_emps
                    )

                    suggested_fix = None
                    suggested_emp_id = None
                    suggested_emp_name = None

                    if backup_result:
                        best_emp, reason_note = backup_result
                        suggested_emp_id = best_emp.id
                        suggested_emp_name = best_emp.name
                        suggested_fix = f"Assign {best_emp.name} ({reason_note}) to fill coverage."
                    else:
                        suggested_fix = f"Requires Pod Lead or external cross-pod reallocation (All {brand.pod_id} members committed)."

                    conflicts.append(Conflict(
                        id=f"conf-cov-{uuid.uuid4().hex[:8]}",
                        date=date_str,
                        brand_id=brand.id,
                        brand_name=brand.name,
                        process_type=proc_req.process_type,
                        severity=ConflictSeverity.CRITICAL,
                        conflict_type=ConflictType.COVERAGE_GAP,
                        message=f"Coverage Gap: '{brand.name}' [{proc_req.process_type.value}] has {active_count}/{proc_req.min_staff} required staff.",
                        suggested_fix=suggested_fix,
                        suggested_employee_id=suggested_emp_id,
                        suggested_employee_name=suggested_emp_name
                    ))

    # 2. Audit Employee Health (Fatigue / Max Consecutive Working Days)
    sorted_dates = sorted(dates)
    for emp in employees:
        consecutive_work_days = 0
        for date_str in sorted_dates:
            cell = cell_by_emp_date.get((date_str, emp.id))
            if cell and cell.status == ShiftStatus.WORKING:
                consecutive_work_days += 1
                if consecutive_work_days > emp.max_consecutive_days:
                    conflicts.append(Conflict(
                        id=f"conf-fat-{uuid.uuid4().hex[:8]}",
                        date=date_str,
                        employee_id=emp.id,
                        employee_name=emp.name,
                        severity=ConflictSeverity.WARNING,
                        conflict_type=ConflictType.FATIGUE_EXCEEDED,
                        message=f"Fatigue Risk: {emp.name} scheduled for {consecutive_work_days} consecutive days (Max permitted: {emp.max_consecutive_days}).",
                        suggested_fix="Schedule a mandatory weekly off or swap shift with pod peer."
                    ))
            else:
                consecutive_work_days = 0

    # 3. Audit Leave Violations
    for leave in leaves:
        cell = cell_by_emp_date.get((leave.date, leave.employee_id))
        if cell and cell.status == ShiftStatus.WORKING:
            emp = emp_map.get(leave.employee_id)
            conflicts.append(Conflict(
                id=f"conf-leave-{uuid.uuid4().hex[:8]}",
                date=leave.date,
                employee_id=leave.employee_id,
                employee_name=emp.name if emp else "Unknown",
                severity=ConflictSeverity.CRITICAL,
                conflict_type=ConflictType.LEAVE_VIOLATION,
                message=f"Leave Conflict: {emp.name if emp else leave.employee_id} is scheduled to WORK on approved leave date ({leave.reason or leave.leave_type.value}).",
                suggested_fix="Release employee from shift and assign pod backup."
            ))

    return conflicts
