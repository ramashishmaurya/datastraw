from enum import Enum
from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class ProcessType(str, Enum):
    CS = "CS"                  # Customer Support
    ACC = "ACC"                # Abandoned Cart Conversions
    NDR = "NDR"                # Non-Delivery Report Management
    RETENTION = "RETENTION"    # Customer Retention

class OperatingModel(str, Enum):
    DAYS_365 = "365_DAYS"                      # 365 days coverage including Sundays & Holidays
    DAILY_EXCEPT_HOLIDAYS = "DAILY_EXCEPT_HOLIDAYS" # Mon-Sun but Public Holidays off
    MON_SAT_NO_HOLIDAYS = "MON_SAT_NO_HOLIDAYS"     # Mon-Sat, Sundays and Public Holidays off
    MON_FRI_NO_HOLIDAYS = "MON_FRI_NO_HOLIDAYS"     # Mon-Fri, Weekends and Public Holidays off
    CUSTOM = "CUSTOM"

class ShiftStatus(str, Enum):
    WORKING = "WORKING"
    WEEKLY_OFF = "WEEKLY_OFF"
    PLANNED_LEAVE = "PLANNED_LEAVE"
    COMP_OFF = "COMP_OFF"
    PUBLIC_HOLIDAY_OFF = "PUBLIC_HOLIDAY_OFF"
    SICK_LEAVE = "SICK_LEAVE"

class ConflictSeverity(str, Enum):
    CRITICAL = "CRITICAL"   # Business SLA breach (e.g. 0 coverage for active brand)
    WARNING = "WARNING"     # Labour / Fatigue rule breach (>6 consecutive work days)
    INFO = "INFO"           # Soft preference violated (e.g. employee didn't get preferred off)

class ConflictType(str, Enum):
    COVERAGE_GAP = "COVERAGE_GAP"
    OVERLAPPING_SHIFT = "OVERLAPPING_SHIFT"
    FATIGUE_EXCEEDED = "FATIGUE_EXCEEDED"
    LEAVE_VIOLATION = "LEAVE_VIOLATION"
    PREFERENCE_VIOLATION = "PREFERENCE_VIOLATION"

class Pod(BaseModel):
    id: str
    name: str
    lead_id: str
    lead_name: Optional[str] = None
    description: str

class Employee(BaseModel):
    id: str
    name: str
    email: str
    pod_id: str
    is_pod_lead: bool = False
    skills: List[ProcessType]
    weekly_off_preference: int = 0  # 0 = Sunday, 1 = Monday, etc.
    max_consecutive_days: int = 6

class ProcessRequirement(BaseModel):
    process_type: ProcessType
    min_staff: int = 1
    operates_sundays: bool = True
    operates_holidays: bool = True

class Brand(BaseModel):
    id: str
    name: str
    pod_id: str
    operating_model: OperatingModel
    process_requirements: List[ProcessRequirement]
    is_single_resource: bool = True

class Allocation(BaseModel):
    employee_id: str
    brand_id: str
    process_type: ProcessType
    is_primary: bool = True

class LeaveRecord(BaseModel):
    id: str
    employee_id: str
    date: str  # YYYY-MM-DD
    leave_type: ShiftStatus
    reason: Optional[str] = None

class PublicHoliday(BaseModel):
    date: str  # YYYY-MM-DD
    name: str

class RosterCell(BaseModel):
    date: str  # YYYY-MM-DD
    employee_id: str
    employee_name: Optional[str] = None
    brand_id: Optional[str] = None
    brand_name: Optional[str] = None
    process_type: Optional[ProcessType] = None
    status: ShiftStatus
    is_backup: bool = False
    notes: Optional[str] = None

class Conflict(BaseModel):
    id: str
    date: str
    brand_id: Optional[str] = None
    brand_name: Optional[str] = None
    process_type: Optional[ProcessType] = None
    employee_id: Optional[str] = None
    employee_name: Optional[str] = None
    severity: ConflictSeverity
    conflict_type: ConflictType
    message: str
    suggested_fix: Optional[str] = None
    suggested_employee_id: Optional[str] = None
    suggested_employee_name: Optional[str] = None

class GenerateRosterRequest(BaseModel):
    year: int = 2026
    month: int = 11  # November 2026

class RosterResponse(BaseModel):
    year: int
    month: int
    total_days: int
    cells: List[RosterCell]
    conflicts: List[Conflict]
    metrics: Dict[str, int]

class ShiftUpdateRequest(BaseModel):
    date: str
    employee_id: str
    status: ShiftStatus
    brand_id: Optional[str] = None
    process_type: Optional[ProcessType] = None
    is_backup: bool = False
    notes: Optional[str] = None

class SimulationRequest(BaseModel):
    date: str
    employee_id: str
    action: str  # "MARK_SICK_LEAVE", "CHANGE_WEEKLY_OFF", "CANCEL_LEAVE"
    leave_type: Optional[ShiftStatus] = ShiftStatus.SICK_LEAVE

class SimulationResponse(BaseModel):
    date: str
    employee_id: str
    employee_name: str
    impacted_brands: List[str]
    new_conflicts: List[Conflict]
    backup_recommendations: List[Dict[str, str]]
    summary: str
