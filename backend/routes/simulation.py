from fastapi import APIRouter, HTTPException
from typing import List, Dict
import copy

from models.schemas import (
    SimulationRequest, SimulationResponse, ShiftStatus, Conflict, ConflictSeverity, ConflictType
)
from routes.master_data import current_employees, current_brands, current_allocations, current_holidays, current_leaves
from routes.roster import get_or_create_roster
from engine.validator import does_brand_operate
from engine.resolver import find_best_backup

router = APIRouter(prefix="/api/simulation", tags=["Change & Impact Simulation"])

@router.post("/evaluate", response_model=SimulationResponse)
def simulate_availability_change(req: SimulationRequest):
    """
    Demonstrates Section 3F: Handling Changes post-roster generation.
    Simulates what happens if an employee becomes unavailable (e.g. sick leave / emergency).
    Evaluates:
    - Which client brands are impacted.
    - Whether remaining employees can sustain the shift (multi-resource) or if it creates an immediate gap (single-resource).
    - Identifies pod backup recommendations.
    """
    emp_map = {e.id: e for e in current_employees}
    brand_map = {b.id: b for b in current_brands}
    target_emp = emp_map.get(req.employee_id)

    if not target_emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Find which brands this employee is allocated to
    allocated_brands = [a for a in current_allocations if a.employee_id == req.employee_id]
    impacted_brand_ids = list({a.brand_id for a in allocated_brands})
    impacted_brand_names = [brand_map[b_id].name for b_id in impacted_brand_ids if b_id in brand_map]

    roster = get_or_create_roster()
    cells_dict = {(c.date, c.employee_id): c for c in roster.cells}

    new_conflicts: List[Conflict] = []
    backup_recommendations: List[Dict[str, str]] = []

    holiday_map = {h.date: h.name for h in current_holidays}
    pod_peers = [e for e in current_employees if e.pod_id == target_emp.pod_id and e.id != target_emp.id]

    for alloc in allocated_brands:
        brand = brand_map.get(alloc.brand_id)
        if not brand:
            continue

        # Check if brand operates on this date
        matching_reqs = [r for r in brand.process_requirements if r.process_type == alloc.process_type]
        if not matching_reqs:
            continue
        proc_req = matching_reqs[0]

        operates, reason = does_brand_operate(req.date, brand, proc_req, holiday_map)
        if not operates:
            continue # Brand is closed on this date anyway

        # Check if brand is single-resource vs multi-resource
        if brand.is_single_resource:
            # Single resource is going away -> immediate critical coverage gap!
            backup_result = find_best_backup(
                date=req.date,
                brand=brand,
                process=alloc.process_type,
                pod_employees=pod_peers,
                current_cells=cells_dict,
                all_allocations=current_allocations
            )

            rec_emp_name = backup_result[0].name if backup_result else "No internal pod peer free"
            rec_emp_id = backup_result[0].id if backup_result else None
            fix_text = f"Deploy {rec_emp_name} ({backup_result[1]})" if backup_result else "Escalate to Operations Manager"

            new_conflicts.append(Conflict(
                id=f"sim-gap-{brand.id}",
                date=req.date,
                brand_id=brand.id,
                brand_name=brand.name,
                process_type=alloc.process_type,
                severity=ConflictSeverity.CRITICAL,
                conflict_type=ConflictType.COVERAGE_GAP,
                message=f"CRITICAL GAP: {target_emp.name} is the SOLE resource for {brand.name}. Marking {req.action} leaves 0/{proc_req.min_staff} staff.",
                suggested_fix=fix_text,
                suggested_employee_id=rec_emp_id,
                suggested_employee_name=rec_emp_name
            ))

            if backup_result:
                backup_recommendations.append({
                    "brand_id": brand.id,
                    "brand_name": brand.name,
                    "process_type": alloc.process_type.value,
                    "recommended_employee_id": backup_result[0].id,
                    "recommended_employee_name": backup_result[0].name,
                    "rationale": backup_result[1]
                })

        else:
            # Multi-resource brand: Check if remaining assigned employees can maintain coverage
            other_assigned = [
                a for a in current_allocations 
                if a.brand_id == brand.id and a.process_type == alloc.process_type and a.employee_id != target_emp.id
            ]
            
            # Check how many other assigned members are working on this date
            active_peers = 0
            for peer_alloc in other_assigned:
                cell = cells_dict.get((req.date, peer_alloc.employee_id))
                if cell and cell.status == ShiftStatus.WORKING:
                    active_peers += 1

            if active_peers >= proc_req.min_staff:
                # Can sustain!
                backup_recommendations.append({
                    "brand_id": brand.id,
                    "brand_name": brand.name,
                    "process_type": alloc.process_type.value,
                    "recommended_employee_id": "",
                    "recommended_employee_name": "Remaining Team",
                    "rationale": f"Multi-resource resilience: {active_peers} other assigned peers maintain the minimum {proc_req.min_staff} headcount without external backup."
                })
            else:
                # Understaffed even with multi-resource
                new_conflicts.append(Conflict(
                    id=f"sim-multi-gap-{brand.id}",
                    date=req.date,
                    brand_id=brand.id,
                    brand_name=brand.name,
                    process_type=alloc.process_type,
                    severity=ConflictSeverity.WARNING,
                    conflict_type=ConflictType.COVERAGE_GAP,
                    message=f"Degraded Headcount: {brand.name} [{alloc.process_type.value}] drops to {active_peers}/{proc_req.min_staff} staff.",
                    suggested_fix="Reallocate peer associate or adjust service level."
                ))

    summary = (
        f"Simulated {req.action} for {target_emp.name} on {req.date}. "
        f"Impacts {len(impacted_brand_ids)} brand(s). "
        f"Generated {len(new_conflicts)} coverage alert(s) and {len(backup_recommendations)} resolution proposal(s)."
    )

    return SimulationResponse(
        date=req.date,
        employee_id=target_emp.id,
        employee_name=target_emp.name,
        impacted_brands=impacted_brand_names,
        new_conflicts=new_conflicts,
        backup_recommendations=backup_recommendations,
        summary=summary
    )
