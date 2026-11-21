from typing import List, Dict, Optional, Tuple
from models.schemas import (
    Employee, Brand, ProcessType, ShiftStatus, RosterCell, Pod
)

def find_best_backup(
    date: str,
    brand: Brand,
    process: ProcessType,
    pod_employees: List[Employee],
    current_cells: Dict[Tuple[str, str], RosterCell], # (date, emp_id) -> cell
    all_allocations: list,
    exclude_emp_ids: Optional[List[str]] = None
) -> Optional[Tuple[Employee, str]]:
    """
    Finds the best eligible backup employee within the same Pod for a coverage gap.
    Criteria:
    1. Belongs to the same pod.
    2. Possesses the required process skill (e.g. CS, NDR, ACC).
    3. Is NOT the absent employee.
    4. Not on leave.
    5. Prioritizes floating associates and Pod Leads.
    """
    exclude_set = set(exclude_emp_ids or [])
    candidates = []

    for emp in pod_employees:
        if emp.id in exclude_set:
            continue

        # Check skill
        if process not in emp.skills:
            continue

        cell_key = (date, emp.id)
        current_cell = current_cells.get(cell_key)

        # If employee is already on approved leave or sick leave, cannot backup
        if current_cell and current_cell.status in [ShiftStatus.PLANNED_LEAVE, ShiftStatus.SICK_LEAVE, ShiftStatus.COMP_OFF, ShiftStatus.WEEKLY_OFF]:
            continue

        # Check current work assignment
        score = 10
        reason = f"Cross-trained in {process.value} in same pod"

        if current_cell and current_cell.status == ShiftStatus.WORKING:
            if not current_cell.brand_id:
                # Floating buffer associate or Pod Lead doing oversight
                score += 5
                reason = "Available buffer in Pod"
            elif current_cell.is_backup:
                # Already assigned as backup elsewhere today
                continue
            else:
                # Primary working on another brand today - lower priority
                score -= 3
                reason = f"Active on {current_cell.brand_name} (cross-cover)"

        if emp.is_pod_lead:
            score += 2 # Pod leads have high readiness
            reason += " (Pod Lead)"

        candidates.append((score, emp, reason))

    if not candidates:
        # Fallback: Check if any pod peer on weekly off can be offered comp-off overtime
        for emp in pod_employees:
            if emp.id in exclude_set or process not in emp.skills:
                continue
            cell_key = (date, emp.id)
            current_cell = current_cells.get(cell_key)
            if current_cell and current_cell.status == ShiftStatus.WEEKLY_OFF:
                candidates.append((1, emp, "Pod Peer on Weekly Off (Comp-off opportunity)"))

    if not candidates:
        return None

    # Sort by highest score
    candidates.sort(key=lambda x: x[0], reverse=True)
    best = candidates[0]
    return best[1], best[2]
