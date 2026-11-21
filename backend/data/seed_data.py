from typing import List, Dict
from models.schemas import (
    Pod, Employee, Brand, ProcessRequirement, ProcessType,
    OperatingModel, Allocation, LeaveRecord, PublicHoliday, ShiftStatus
)

# 4 Operational Pods
PODS: List[Pod] = [
    Pod(
        id="pod-1",
        name="Pod Alpha - Fashion & Lifestyle",
        lead_id="emp-01",
        lead_name="Priya Sharma",
        description="Oversees fast-moving D2C fashion apparel and accessory brands."
    ),
    Pod(
        id="pod-2",
        name="Pod Beta - Beauty & Personal Care",
        lead_id="emp-09",
        lead_name="Rohan Verma",
        description="Manages high-touch cosmetics, skincare, and organic wellness brands."
    ),
    Pod(
        id="pod-3",
        name="Pod Gamma - Consumer Tech & Electronics",
        lead_id="emp-17",
        lead_name="Ananya Iyer",
        description="Handles technical support, warranty queries, and high-ticket D2C electronics."
    ),
    Pod(
        id="pod-4",
        name="Pod Delta - Health, Nutrition & Food",
        lead_id="emp-25",
        lead_name="Vikram Malhotra",
        description="Supports perishable goods, nutraceuticals, and quick-delivery consumables."
    ),
]

# 32 Employees (Exceeds 30 minimum requirement)
EMPLOYEES: List[Employee] = [
    # Pod Alpha (8 members)
    Employee(id="emp-01", name="Priya Sharma", email="priya.s@datastraw.in", pod_id="pod-1", is_pod_lead=True, skills=[ProcessType.CS, ProcessType.ACC, ProcessType.NDR, ProcessType.RETENTION], weekly_off_preference=0),
    Employee(id="emp-02", name="Aarav Patel", email="aarav.p@datastraw.in", pod_id="pod-1", skills=[ProcessType.CS, ProcessType.ACC, ProcessType.NDR], weekly_off_preference=0),
    Employee(id="emp-03", name="Diya Mukherjee", email="diya.m@datastraw.in", pod_id="pod-1", skills=[ProcessType.CS, ProcessType.RETENTION], weekly_off_preference=0),
    Employee(id="emp-04", name="Kabir Mehta", email="kabir.m@datastraw.in", pod_id="pod-1", skills=[ProcessType.CS, ProcessType.ACC], weekly_off_preference=1),
    Employee(id="emp-05", name="Neha Kapoor", email="neha.k@datastraw.in", pod_id="pod-1", skills=[ProcessType.CS, ProcessType.NDR], weekly_off_preference=0),
    Employee(id="emp-06", name="Ishaan Joshi", email="ishaan.j@datastraw.in", pod_id="pod-1", skills=[ProcessType.ACC, ProcessType.RETENTION], weekly_off_preference=6),
    Employee(id="emp-07", name="Tanvi Sen", email="tanvi.s@datastraw.in", pod_id="pod-1", skills=[ProcessType.CS, ProcessType.ACC, ProcessType.NDR], weekly_off_preference=0),
    Employee(id="emp-08", name="Aditya Rao", email="aditya.r@datastraw.in", pod_id="pod-1", skills=[ProcessType.CS, ProcessType.NDR], weekly_off_preference=2),

    # Pod Beta (8 members)
    Employee(id="emp-09", name="Rohan Verma", email="rohan.v@datastraw.in", pod_id="pod-2", is_pod_lead=True, skills=[ProcessType.CS, ProcessType.ACC, ProcessType.NDR, ProcessType.RETENTION], weekly_off_preference=0),
    Employee(id="emp-10", name="Sanya Nair", email="sanya.n@datastraw.in", pod_id="pod-2", skills=[ProcessType.CS, ProcessType.ACC], weekly_off_preference=0),
    Employee(id="emp-11", name="Kunal Deshmukh", email="kunal.d@datastraw.in", pod_id="pod-2", skills=[ProcessType.CS, ProcessType.NDR], weekly_off_preference=1),
    Employee(id="emp-12", name="Pooja Hegde", email="pooja.h@datastraw.in", pod_id="pod-2", skills=[ProcessType.CS, ProcessType.ACC, ProcessType.RETENTION], weekly_off_preference=0),
    Employee(id="emp-13", name="Arjun Bhatia", email="arjun.b@datastraw.in", pod_id="pod-2", skills=[ProcessType.CS, ProcessType.NDR], weekly_off_preference=0),
    Employee(id="emp-14", name="Meera Chawla", email="meera.c@datastraw.in", pod_id="pod-2", skills=[ProcessType.ACC, ProcessType.RETENTION], weekly_off_preference=6),
    Employee(id="emp-15", name="Siddharth Roy", email="siddharth.r@datastraw.in", pod_id="pod-2", skills=[ProcessType.CS, ProcessType.ACC, ProcessType.NDR], weekly_off_preference=0),
    Employee(id="emp-16", name="Riya Banerjee", email="riya.b@datastraw.in", pod_id="pod-2", skills=[ProcessType.CS, ProcessType.RETENTION], weekly_off_preference=3),

    # Pod Gamma (8 members)
    Employee(id="emp-17", name="Ananya Iyer", email="ananya.i@datastraw.in", pod_id="pod-3", is_pod_lead=True, skills=[ProcessType.CS, ProcessType.ACC, ProcessType.NDR, ProcessType.RETENTION], weekly_off_preference=0),
    Employee(id="emp-18", name="Varun Reddy", email="varun.r@datastraw.in", pod_id="pod-3", skills=[ProcessType.CS, ProcessType.NDR], weekly_off_preference=0),
    Employee(id="emp-19", name="Kavya Menon", email="kavya.m@datastraw.in", pod_id="pod-3", skills=[ProcessType.CS, ProcessType.ACC], weekly_off_preference=1),
    Employee(id="emp-20", name="Devansh Saxena", email="devansh.s@datastraw.in", pod_id="pod-3", skills=[ProcessType.CS, ProcessType.ACC, ProcessType.RETENTION], weekly_off_preference=0),
    Employee(id="emp-21", name="Simran Gill", email="simran.g@datastraw.in", pod_id="pod-3", skills=[ProcessType.CS, ProcessType.NDR], weekly_off_preference=0),
    Employee(id="emp-22", name="Ayush Singhania", email="ayush.s@datastraw.in", pod_id="pod-3", skills=[ProcessType.ACC, ProcessType.RETENTION], weekly_off_preference=6),
    Employee(id="emp-23", name="Shruti Das", email="shruti.d@datastraw.in", pod_id="pod-3", skills=[ProcessType.CS, ProcessType.ACC, ProcessType.NDR], weekly_off_preference=0),
    Employee(id="emp-24", name="Manish Kaushik", email="manish.k@datastraw.in", pod_id="pod-3", skills=[ProcessType.CS, ProcessType.NDR], weekly_off_preference=4),

    # Pod Delta (8 members)
    Employee(id="emp-25", name="Vikram Malhotra", email="vikram.m@datastraw.in", pod_id="pod-4", is_pod_lead=True, skills=[ProcessType.CS, ProcessType.ACC, ProcessType.NDR, ProcessType.RETENTION], weekly_off_preference=0),
    Employee(id="emp-26", name="Anjali Bose", email="anjali.b@datastraw.in", pod_id="pod-4", skills=[ProcessType.CS, ProcessType.ACC], weekly_off_preference=0),
    Employee(id="emp-27", name="Gaurav Nanda", email="gaurav.n@datastraw.in", pod_id="pod-4", skills=[ProcessType.CS, ProcessType.NDR], weekly_off_preference=1),
    Employee(id="emp-28", name="Pallavi Kulkarni", email="pallavi.k@datastraw.in", pod_id="pod-4", skills=[ProcessType.CS, ProcessType.RETENTION], weekly_off_preference=0),
    Employee(id="emp-29", name="Nikhil Aggarwal", email="nikhil.a@datastraw.in", pod_id="pod-4", skills=[ProcessType.CS, ProcessType.ACC, ProcessType.NDR], weekly_off_preference=0),
    Employee(id="emp-30", name="Bhavna Varma", email="bhavna.v@datastraw.in", pod_id="pod-4", skills=[ProcessType.ACC, ProcessType.RETENTION], weekly_off_preference=6),
    Employee(id="emp-31", name="Tarun Chhabra", email="tarun.c@datastraw.in", pod_id="pod-4", skills=[ProcessType.CS, ProcessType.NDR], weekly_off_preference=0),
    Employee(id="emp-32", name="Kriti Sethi", email="kriti.s@datastraw.in", pod_id="pod-4", skills=[ProcessType.CS, ProcessType.ACC], weekly_off_preference=5),
]

# 16 Brands total
# 13 are single-resource brands (~81%), 3 are multi-resource brands (~19%)
BRANDS: List[Brand] = [
    # Pod Alpha Brands
    Brand(
        id="brand-01",
        name="Snitch & Stitch (D2C Apparel)",
        pod_id="pod-1",
        operating_model=OperatingModel.DAYS_365,
        is_single_resource=True,
        process_requirements=[
            ProcessRequirement(process_type=ProcessType.CS, min_staff=1, operates_sundays=True, operates_holidays=True),
            ProcessRequirement(process_type=ProcessType.ACC, min_staff=1, operates_sundays=True, operates_holidays=True),
        ]
    ),
    Brand(
        id="brand-02",
        name="UrbanThreads (Streetwear)",
        pod_id="pod-1",
        operating_model=OperatingModel.MON_SAT_NO_HOLIDAYS,
        is_single_resource=True,
        process_requirements=[
            ProcessRequirement(process_type=ProcessType.CS, min_staff=1, operates_sundays=False, operates_holidays=False),
            ProcessRequirement(process_type=ProcessType.NDR, min_staff=1, operates_sundays=False, operates_holidays=False),
        ]
    ),
    Brand(
        id="brand-03",
        name="Aura Linen (Luxury Bedding)",
        pod_id="pod-1",
        operating_model=OperatingModel.DAILY_EXCEPT_HOLIDAYS,
        is_single_resource=True,
        process_requirements=[
            ProcessRequirement(process_type=ProcessType.CS, min_staff=1, operates_sundays=True, operates_holidays=False),
        ]
    ),
    Brand(
        id="brand-04",
        name="Nova Activewear (Athleisure) [Multi-Resource]",
        pod_id="pod-1",
        operating_model=OperatingModel.DAYS_365,
        is_single_resource=False,
        process_requirements=[
            ProcessRequirement(process_type=ProcessType.CS, min_staff=1, operates_sundays=True, operates_holidays=True),
            ProcessRequirement(process_type=ProcessType.ACC, min_staff=1, operates_sundays=True, operates_holidays=True),
            ProcessRequirement(process_type=ProcessType.NDR, min_staff=1, operates_sundays=False, operates_holidays=False),
        ]
    ),

    # Pod Beta Brands
    Brand(
        id="brand-05",
        name="GlowBotanics (Organic Skincare)",
        pod_id="pod-2",
        operating_model=OperatingModel.DAYS_365,
        is_single_resource=True,
        process_requirements=[
            ProcessRequirement(process_type=ProcessType.CS, min_staff=1, operates_sundays=True, operates_holidays=True),
            ProcessRequirement(process_type=ProcessType.ACC, min_staff=1, operates_sundays=True, operates_holidays=True),
        ]
    ),
    Brand(
        id="brand-06",
        name="VelvetHair (Hair Care)",
        pod_id="pod-2",
        operating_model=OperatingModel.MON_SAT_NO_HOLIDAYS,
        is_single_resource=True,
        process_requirements=[
            ProcessRequirement(process_type=ProcessType.CS, min_staff=1, operates_sundays=False, operates_holidays=False),
            ProcessRequirement(process_type=ProcessType.NDR, min_staff=1, operates_sundays=False, operates_holidays=False),
        ]
    ),
    Brand(
        id="brand-07",
        name="LuxeAromas (Perfumes)",
        pod_id="pod-2",
        operating_model=OperatingModel.MON_FRI_NO_HOLIDAYS,
        is_single_resource=True,
        process_requirements=[
            ProcessRequirement(process_type=ProcessType.CS, min_staff=1, operates_sundays=False, operates_holidays=False),
        ]
    ),
    Brand(
        id="brand-08",
        name="DermaScience (Clinical Cosmeceuticals) [Multi-Resource]",
        pod_id="pod-2",
        operating_model=OperatingModel.DAYS_365,
        is_single_resource=False,
        process_requirements=[
            ProcessRequirement(process_type=ProcessType.CS, min_staff=2, operates_sundays=True, operates_holidays=True),
            ProcessRequirement(process_type=ProcessType.ACC, min_staff=1, operates_sundays=True, operates_holidays=True),
        ]
    ),

    # Pod Gamma Brands
    Brand(
        id="brand-09",
        name="SonicBeats (Audio & Earbuds)",
        pod_id="pod-3",
        operating_model=OperatingModel.DAYS_365,
        is_single_resource=True,
        process_requirements=[
            ProcessRequirement(process_type=ProcessType.CS, min_staff=1, operates_sundays=True, operates_holidays=True),
            ProcessRequirement(process_type=ProcessType.NDR, min_staff=1, operates_sundays=False, operates_holidays=False),
        ]
    ),
    Brand(
        id="brand-10",
        name="VoltCharge (Power Banks & Cables)",
        pod_id="pod-3",
        operating_model=OperatingModel.MON_SAT_NO_HOLIDAYS,
        is_single_resource=True,
        process_requirements=[
            ProcessRequirement(process_type=ProcessType.CS, min_staff=1, operates_sundays=False, operates_holidays=False),
        ]
    ),
    Brand(
        id="brand-11",
        name="NexWatch (Smartwatches)",
        pod_id="pod-3",
        operating_model=OperatingModel.DAILY_EXCEPT_HOLIDAYS,
        is_single_resource=True,
        process_requirements=[
            ProcessRequirement(process_type=ProcessType.CS, min_staff=1, operates_sundays=True, operates_holidays=False),
            ProcessRequirement(process_type=ProcessType.ACC, min_staff=1, operates_sundays=True, operates_holidays=False),
        ]
    ),
    Brand(
        id="brand-12",
        name="HyperGaming (Peripherals & Gear) [Multi-Resource]",
        pod_id="pod-3",
        operating_model=OperatingModel.DAYS_365,
        is_single_resource=False,
        process_requirements=[
            ProcessRequirement(process_type=ProcessType.CS, min_staff=2, operates_sundays=True, operates_holidays=True),
            ProcessRequirement(process_type=ProcessType.NDR, min_staff=1, operates_sundays=False, operates_holidays=False),
        ]
    ),

    # Pod Delta Brands
    Brand(
        id="brand-13",
        name="GreenFuel (Keto & Vegan Snacks)",
        pod_id="pod-4",
        operating_model=OperatingModel.DAYS_365,
        is_single_resource=True,
        process_requirements=[
            ProcessRequirement(process_type=ProcessType.CS, min_staff=1, operates_sundays=True, operates_holidays=True),
            ProcessRequirement(process_type=ProcessType.ACC, min_staff=1, operates_sundays=True, operates_holidays=True),
        ]
    ),
    Brand(
        id="brand-14",
        name="PureCold (Cold-Pressed Juices)",
        pod_id="pod-4",
        operating_model=OperatingModel.MON_SAT_NO_HOLIDAYS,
        is_single_resource=True,
        process_requirements=[
            ProcessRequirement(process_type=ProcessType.CS, min_staff=1, operates_sundays=False, operates_holidays=False),
            ProcessRequirement(process_type=ProcessType.NDR, min_staff=1, operates_sundays=False, operates_holidays=False),
        ]
    ),
    Brand(
        id="brand-15",
        name="VitalVitamins (Supplements)",
        pod_id="pod-4",
        operating_model=OperatingModel.MON_FRI_NO_HOLIDAYS,
        is_single_resource=True,
        process_requirements=[
            ProcessRequirement(process_type=ProcessType.CS, min_staff=1, operates_sundays=False, operates_holidays=False),
        ]
    ),
    Brand(
        id="brand-16",
        name="NatureDrop (Honey & Ghee)",
        pod_id="pod-4",
        operating_model=OperatingModel.DAILY_EXCEPT_HOLIDAYS,
        is_single_resource=True,
        process_requirements=[
            ProcessRequirement(process_type=ProcessType.CS, min_staff=1, operates_sundays=True, operates_holidays=False),
        ]
    ),
]

# Allocations: Mapping employees to brands and processes
# ~80% single-resource: 1 employee handles all processes for that brand
# 3 brands have 2-3 employees assigned (some by process, some overlapping)
ALLOCATIONS: List[Allocation] = [
    # Pod Alpha Allocations
    Allocation(employee_id="emp-02", brand_id="brand-01", process_type=ProcessType.CS, is_primary=True),
    Allocation(employee_id="emp-02", brand_id="brand-01", process_type=ProcessType.ACC, is_primary=True),
    
    Allocation(employee_id="emp-03", brand_id="brand-02", process_type=ProcessType.CS, is_primary=True),
    Allocation(employee_id="emp-03", brand_id="brand-02", process_type=ProcessType.NDR, is_primary=True),
    
    Allocation(employee_id="emp-04", brand_id="brand-03", process_type=ProcessType.CS, is_primary=True),
    
    # Brand 04 (Multi-resource: 3 employees assigned)
    Allocation(employee_id="emp-05", brand_id="brand-04", process_type=ProcessType.CS, is_primary=True),
    Allocation(employee_id="emp-06", brand_id="brand-04", process_type=ProcessType.ACC, is_primary=True),
    Allocation(employee_id="emp-07", brand_id="brand-04", process_type=ProcessType.NDR, is_primary=True),
    Allocation(employee_id="emp-08", brand_id="brand-04", process_type=ProcessType.CS, is_primary=False), # Overlapping CS support

    # Pod Beta Allocations
    Allocation(employee_id="emp-10", brand_id="brand-05", process_type=ProcessType.CS, is_primary=True),
    Allocation(employee_id="emp-10", brand_id="brand-05", process_type=ProcessType.ACC, is_primary=True),

    Allocation(employee_id="emp-11", brand_id="brand-06", process_type=ProcessType.CS, is_primary=True),
    Allocation(employee_id="emp-11", brand_id="brand-06", process_type=ProcessType.NDR, is_primary=True),

    Allocation(employee_id="emp-12", brand_id="brand-07", process_type=ProcessType.CS, is_primary=True),

    # Brand 08 (Multi-resource: 3 employees assigned)
    Allocation(employee_id="emp-13", brand_id="brand-08", process_type=ProcessType.CS, is_primary=True),
    Allocation(employee_id="emp-14", brand_id="brand-08", process_type=ProcessType.ACC, is_primary=True),
    Allocation(employee_id="emp-15", brand_id="brand-08", process_type=ProcessType.CS, is_primary=True),
    Allocation(employee_id="emp-16", brand_id="brand-08", process_type=ProcessType.CS, is_primary=False),

    # Pod Gamma Allocations
    Allocation(employee_id="emp-18", brand_id="brand-09", process_type=ProcessType.CS, is_primary=True),
    Allocation(employee_id="emp-18", brand_id="brand-09", process_type=ProcessType.NDR, is_primary=True),

    Allocation(employee_id="emp-19", brand_id="brand-10", process_type=ProcessType.CS, is_primary=True),

    Allocation(employee_id="emp-20", brand_id="brand-11", process_type=ProcessType.CS, is_primary=True),
    Allocation(employee_id="emp-20", brand_id="brand-11", process_type=ProcessType.ACC, is_primary=True),

    # Brand 12 (Multi-resource: 3 employees assigned)
    Allocation(employee_id="emp-21", brand_id="brand-12", process_type=ProcessType.CS, is_primary=True),
    Allocation(employee_id="emp-22", brand_id="brand-12", process_type=ProcessType.NDR, is_primary=True),
    Allocation(employee_id="emp-23", brand_id="brand-12", process_type=ProcessType.CS, is_primary=True),
    Allocation(employee_id="emp-24", brand_id="brand-12", process_type=ProcessType.CS, is_primary=False),

    # Pod Delta Allocations
    Allocation(employee_id="emp-26", brand_id="brand-13", process_type=ProcessType.CS, is_primary=True),
    Allocation(employee_id="emp-26", brand_id="brand-13", process_type=ProcessType.ACC, is_primary=True),

    Allocation(employee_id="emp-27", brand_id="brand-14", process_type=ProcessType.CS, is_primary=True),
    Allocation(employee_id="emp-27", brand_id="brand-14", process_type=ProcessType.NDR, is_primary=True),

    Allocation(employee_id="emp-28", brand_id="brand-15", process_type=ProcessType.CS, is_primary=True),

    Allocation(employee_id="emp-29", brand_id="brand-16", process_type=ProcessType.CS, is_primary=True),
    Allocation(employee_id="emp-30", brand_id="brand-16", process_type=ProcessType.CS, is_primary=False),
]

# Public Holidays for November 2026
PUBLIC_HOLIDAYS: List[PublicHoliday] = [
    PublicHoliday(date="2026-11-08", name="Diwali (Deepavali)"),
    PublicHoliday(date="2026-11-24", name="Guru Nanak Jayanti"),
]

# Realistic Pre-configured Planned Leaves and Comp-offs
PRECONFIGURED_LEAVES: List[LeaveRecord] = [
    LeaveRecord(id="leave-01", employee_id="emp-02", date="2026-11-12", leave_type=ShiftStatus.PLANNED_LEAVE, reason="Family wedding"),
    LeaveRecord(id="leave-02", employee_id="emp-02", date="2026-11-13", leave_type=ShiftStatus.PLANNED_LEAVE, reason="Family wedding"),
    LeaveRecord(id="leave-03", employee_id="emp-10", date="2026-11-16", leave_type=ShiftStatus.COMP_OFF, reason="Comp-off for past festive surge"),
    LeaveRecord(id="leave-04", employee_id="emp-18", date="2026-11-04", leave_type=ShiftStatus.PLANNED_LEAVE, reason="Personal appointment"),
    LeaveRecord(id="leave-05", employee_id="emp-05", date="2026-11-20", leave_type=ShiftStatus.PLANNED_LEAVE, reason="Medical checkup"),
]
