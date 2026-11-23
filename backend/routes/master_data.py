from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import Pod, Employee, Brand, Allocation, PublicHoliday, LeaveRecord
from data.seed_data import PODS, EMPLOYEES, BRANDS, ALLOCATIONS, PUBLIC_HOLIDAYS, PRECONFIGURED_LEAVES

router = APIRouter(prefix="/api/master-data", tags=["Master Data"])

# In-memory working copies so operations manager can add/edit/delete dynamically
current_pods = list(PODS)
current_employees = list(EMPLOYEES)
current_brands = list(BRANDS)
current_allocations = list(ALLOCATIONS)
current_holidays = list(PUBLIC_HOLIDAYS)
current_leaves = list(PRECONFIGURED_LEAVES)

@router.get("/pods", response_model=List[Pod])
def get_pods():
    return current_pods

@router.get("/employees", response_model=List[Employee])
def get_employees():
    return current_employees

@router.get("/brands", response_model=List[Brand])
def get_brands():
    return current_brands

@router.get("/allocations", response_model=List[Allocation])
def get_allocations():
    return current_allocations

@router.get("/holidays", response_model=List[PublicHoliday])
def get_holidays():
    return current_holidays

@router.get("/leaves", response_model=List[LeaveRecord])
def get_leaves():
    return current_leaves

@router.post("/allocations", response_model=Allocation)
def add_allocation(alloc: Allocation):
    """Allows operations manager to add or modify resource allocations dynamically."""
    # Remove existing conflicting primary allocation if any
    global current_allocations
    current_allocations = [
        a for a in current_allocations 
        if not (a.brand_id == alloc.brand_id and a.process_type == alloc.process_type and alloc.is_primary and a.is_primary)
    ]
    current_allocations.append(alloc)
    return alloc

