from fastapi import APIRouter, HTTPException
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

router = APIRouter(prefix="/api/roster", tags=["Roster Engine"])

# Global state for current active roster
active_roster: Optional[RosterResponse] = None

def get_or_create_roster(year: int = 2026, month: int = 11) -> RosterResponse:
    global active_roster
    if active_roster is None or active_roster.year != year or active_roster.month != month:
        active_roster = build_roster(
            year=year,
            month=month,
            employees=current_employees,
            brands=current_brands,
            allocations=current_allocations,
            holidays=current_holidays,
            leaves=current_leaves
        )
    return active_roster

@router.get("", response_model=RosterResponse)
def get_current_roster(year: int = 2026, month: int = 11):
    """Fetches the current active roster, cells, conflicts, and health metrics."""
    return get_or_create_roster(year, month)

@router.post("/generate", response_model=RosterResponse)
def generate_roster_endpoint(req: GenerateRosterRequest):
    """Triggers clean deterministic constraint-based roster generation."""
    global active_roster
    active_roster = build_roster(
        year=req.year,
        month=req.month,
        employees=current_employees,
        brands=current_brands,
        allocations=current_allocations,
        holidays=current_holidays,
        leaves=current_leaves
    )
    return active_roster

@router.put("/cell", response_model=RosterResponse)
def update_roster_cell(req: ShiftUpdateRequest):
    """
    Manually edits an employee's shift or marks emergency leave.
    Instantly re-validates and returns updated conflicts and metrics.
    """
    global active_roster
    roster = get_or_create_roster()

    emp_map = {e.id: e for e in current_employees}
    brand_map = {b.id: b for b in current_brands}

    # Find and update matching cell
    target_idx = None
    for idx, c in enumerate(roster.cells):
        if c.date == req.date and c.employee_id == req.employee_id:
            target_idx = idx
            break

    if target_idx is None:
        raise HTTPException(status_code=404, detail="Roster cell not found for given date and employee.")

    emp = emp_map.get(req.employee_id)
    brand = brand_map.get(req.brand_id) if req.brand_id else None

    # Update cell properties
    roster.cells[target_idx].status = req.status
    roster.cells[target_idx].brand_id = req.brand_id
    roster.cells[target_idx].brand_name = brand.name if brand else None
    roster.cells[target_idx].process_type = req.process_type
    roster.cells[target_idx].is_backup = req.is_backup
    roster.cells[target_idx].notes = req.notes or f"Manual change by Ops Manager ({req.status.value})"

    # Re-run validation audit
    dates = sorted(list({c.date for c in roster.cells}))
    updated_conflicts = validate_roster(
        dates=dates,
        brands=current_brands,
        employees=current_employees,
        allocations=current_allocations,
        cells=roster.cells,
        holidays=current_holidays,
        leaves=current_leaves
    )
    roster.conflicts = updated_conflicts

    # Re-calculate health metrics
    critical_conflicts = sum(1 for conf in updated_conflicts if conf.severity == "CRITICAL")
    warning_conflicts = sum(1 for conf in updated_conflicts if conf.severity == "WARNING")
    roster.metrics["critical_conflicts"] = critical_conflicts
    roster.metrics["warning_conflicts"] = warning_conflicts
    roster.metrics["total_conflicts"] = len(updated_conflicts)
    roster.metrics["coverage_health_percent"] = max(0, 100 - (critical_conflicts * 2))

    return roster

class ApplyFixRequest(BaseModel):
    date: str
    brand_id: str
    process_type: ProcessType
    backup_employee_id: str

@router.post("/apply-fix", response_model=RosterResponse)
def apply_recommended_fix(req: ApplyFixRequest):
    """
    1-Click Conflict Resolution.
    Assigns the recommended Pod backup to resolve an identified coverage gap.
    """
    global active_roster
    roster = get_or_create_roster()

    emp_map = {e.id: e for e in current_employees}
    brand_map = {b.id: b for b in current_brands}

    backup_emp = emp_map.get(req.backup_employee_id)
    brand = brand_map.get(req.brand_id)

    if not backup_emp or not brand:
        raise HTTPException(status_code=400, detail="Invalid employee or brand ID.")

    # Find the backup employee's cell on this date and reassign to this brand & process
    for idx, c in enumerate(roster.cells):
        if c.date == req.date and c.employee_id == req.backup_employee_id:
            roster.cells[idx].status = ShiftStatus.WORKING
            roster.cells[idx].brand_id = brand.id
            roster.cells[idx].brand_name = brand.name
            roster.cells[idx].process_type = req.process_type
            roster.cells[idx].is_backup = True
            roster.cells[idx].notes = f"Backup deployed: Covering {brand.name} [{req.process_type.value}]"
            break

    # Re-audit conflicts
    dates = sorted(list({c.date for c in roster.cells}))
    roster.conflicts = validate_roster(
        dates=dates,
        brands=current_brands,
        employees=current_employees,
        allocations=current_allocations,
        cells=roster.cells,
        holidays=current_holidays,
        leaves=current_leaves
    )
    critical_conflicts = sum(1 for conf in roster.conflicts if conf.severity == "CRITICAL")
    roster.metrics["critical_conflicts"] = critical_conflicts
    roster.metrics["total_conflicts"] = len(roster.conflicts)
    roster.metrics["coverage_health_percent"] = max(0, 100 - (critical_conflicts * 2))

    return roster
