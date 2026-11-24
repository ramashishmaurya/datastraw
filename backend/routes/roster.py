from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List, Dict
from pydantic import BaseModel
import copy

from models.schemas import (
    RosterResponse, RosterCell, Conflict, ShiftUpdateRequest,
    GenerateRosterRequest, ShiftStatus, ProcessType
)
from engine.scheduler import build_roster
from engine.validator import validate_roster
from routes.master_data import (
    current_employees, current_brands, current_allocations,
    current_holidays, current_leaves
)
from database import SessionLocal, RosterCellModel, LeaveRecordModel, init_db

router = APIRouter(prefix="/api/roster", tags=["Roster Engine"])

def load_roster_from_db(year: int = 2026, month: int = 11) -> RosterResponse:
    db = SessionLocal()
    try:
        db_cells = db.query(RosterCellModel).all()
        if not db_cells:
            # If empty, initialize and seed
            init_db()
            db_cells = db.query(RosterCellModel).all()

        cells: List[RosterCell] = []
        dates_set = set()

        for c in db_cells:
            dates_set.add(c.date)
            p_type = ProcessType(c.process_type) if c.process_type else None
            cells.append(RosterCell(
                date=c.date,
                employee_id=c.employee_id,
                employee_name=c.employee_name,
                status=ShiftStatus(c.status),
                brand_id=c.brand_id,
                brand_name=c.brand_name,
                process_type=p_type,
                is_backup=c.is_backup,
                notes=c.notes
            ))

        dates = sorted(list(dates_set))

        # Run validation audit on live DB cells
        conflicts = validate_roster(
            dates=dates,
            brands=current_brands,
            employees=current_employees,
            allocations=current_allocations,
            cells=cells,
            holidays=current_holidays,
            leaves=current_leaves
        )

        critical_conflicts = sum(1 for conf in conflicts if conf.severity == "CRITICAL")
        warning_conflicts = sum(1 for conf in conflicts if conf.severity == "WARNING")

        metrics = {
            "total_days": len(dates),
            "total_employees": len(current_employees),
            "total_brands": len(current_brands),
            "total_shifts_working": sum(1 for c in cells if c.status == ShiftStatus.WORKING),
            "total_weekly_offs": sum(1 for c in cells if c.status == ShiftStatus.WEEKLY_OFF),
            "total_leaves": sum(1 for c in cells if c.status in [ShiftStatus.PLANNED_LEAVE, ShiftStatus.SICK_LEAVE, ShiftStatus.COMP_OFF]),
            "critical_conflicts": critical_conflicts,
            "warning_conflicts": warning_conflicts,
            "total_conflicts": len(conflicts),
            "coverage_health_percent": max(0, 100 - (critical_conflicts * 2))
        }

        return RosterResponse(
            year=year,
            month=month,
            total_days=len(dates),
            cells=cells,
            conflicts=conflicts,
            metrics=metrics
        )
    finally:
        db.close()

def get_or_create_roster(year: int = 2026, month: int = 11) -> RosterResponse:
    return load_roster_from_db(year, month)

@router.get("", response_model=RosterResponse)
def get_current_roster(year: int = 2026, month: int = 11):
    """Fetches the current active roster from Database (Neon/SQLite)."""
    return load_roster_from_db(year, month)

@router.post("/generate", response_model=RosterResponse)
def generate_roster_endpoint(req: GenerateRosterRequest):
    """Regenerates the entire monthly roster and saves to Database."""
    new_roster = build_roster(
        year=req.year,
        month=req.month,
        employees=current_employees,
        brands=current_brands,
        allocations=current_allocations,
        holidays=current_holidays,
        leaves=current_leaves
    )

    db = SessionLocal()
    try:
        # Clear existing cells and insert new
        db.query(RosterCellModel).delete()
        for cell in new_roster.cells:
            db_cell = RosterCellModel(
                id=f"{cell.date}_{cell.employee_id}",
                date=cell.date,
                employee_id=cell.employee_id,
                employee_name=cell.employee_name,
                status=cell.status.value,
                brand_id=cell.brand_id,
                brand_name=cell.brand_name,
                process_type=cell.process_type.value if cell.process_type else None,
                is_backup=cell.is_backup,
                notes=cell.notes
            )
            db.add(db_cell)
        db.commit()
    finally:
        db.close()

    return load_roster_from_db(req.year, req.month)

@router.put("/cell", response_model=RosterResponse)
def update_roster_cell(req: ShiftUpdateRequest):
    """Updates a shift cell in the database and re-audits live constraints."""
    db = SessionLocal()
    try:
        cell_id = f"{req.date}_{req.employee_id}"
        db_cell = db.query(RosterCellModel).filter(RosterCellModel.id == cell_id).first()

        brand_map = {b.id: b for b in current_brands}
        brand = brand_map.get(req.brand_id) if req.brand_id else None

        if not db_cell:
            emp_map = {e.id: e for e in current_employees}
            emp = emp_map.get(req.employee_id)
            db_cell = RosterCellModel(
                id=cell_id,
                date=req.date,
                employee_id=req.employee_id,
                employee_name=emp.name if emp else None,
            )
            db.add(db_cell)

        db_cell.status = req.status.value
        db_cell.brand_id = req.brand_id
        db_cell.brand_name = brand.name if brand else None
        db_cell.process_type = req.process_type.value if req.process_type else None
        db_cell.is_backup = req.is_backup
        db_cell.notes = req.notes or f"Manual edit by Ops Manager ({req.status.value})"

        # Synchronize with leave_records table
        leave_statuses = ["PLANNED_LEAVE", "SICK_LEAVE", "COMP_OFF"]
        existing_leave = db.query(LeaveRecordModel).filter(
            LeaveRecordModel.employee_id == req.employee_id,
            LeaveRecordModel.date == req.date
        ).first()

        if req.status.value in leave_statuses:
            if existing_leave:
                existing_leave.leave_type = req.status.value
                existing_leave.reason = req.notes or f"Leave applied via Frontend ({req.status.value})"
            else:
                new_leave = LeaveRecordModel(
                    id=f"leave_{req.employee_id}_{req.date}",
                    employee_id=req.employee_id,
                    date=req.date,
                    leave_type=req.status.value,
                    reason=req.notes or f"Leave applied via Frontend ({req.status.value})"
                )
                db.add(new_leave)
        else:
            if existing_leave:
                db.delete(existing_leave)

        db.commit()
    finally:
        db.close()

    return load_roster_from_db()

class ApplyFixRequest(BaseModel):
    date: str
    brand_id: str
    process_type: ProcessType
    backup_employee_id: str

@router.post("/apply-fix", response_model=RosterResponse)
def apply_recommended_fix(req: ApplyFixRequest):
    """1-Click Fix: Persists recommended backup into the Database."""
    db = SessionLocal()
    try:
        brand_map = {b.id: b for b in current_brands}
        brand = brand_map.get(req.brand_id)
        if not brand:
            raise HTTPException(status_code=400, detail="Invalid brand ID.")

        cell_id = f"{req.date}_{req.backup_employee_id}"
        db_cell = db.query(RosterCellModel).filter(RosterCellModel.id == cell_id).first()

        if not db_cell:
            emp_map = {e.id: e for e in current_employees}
            emp = emp_map.get(req.backup_employee_id)
            db_cell = RosterCellModel(
                id=cell_id,
                date=req.date,
                employee_id=req.backup_employee_id,
                employee_name=emp.name if emp else None,
            )
            db.add(db_cell)

        db_cell.status = ShiftStatus.WORKING.value
        db_cell.brand_id = brand.id
        db_cell.brand_name = brand.name
        db_cell.process_type = req.process_type.value
        db_cell.is_backup = True
        db_cell.notes = f"Backup deployed: Covering {brand.name} [{req.process_type.value}]"
        db.commit()
    finally:
        db.close()

    return load_roster_from_db()
