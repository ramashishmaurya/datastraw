import os
from sqlalchemy import create_engine, Column, String, Boolean, Integer, Text
from sqlalchemy.orm import declarative_base, sessionmaker

# Support Neon PostgreSQL (via Render DATABASE_URL) with local SQLite fallback
DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    # Local fallback
    DATABASE_URL = "sqlite:///./roster.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Neon provides "postgres://..." or "postgresql://..."
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    # Ensure SSL for Neon Postgres
    if "sslmode" not in DATABASE_URL and "sqlite" not in DATABASE_URL:
        separator = "&" if "?" in DATABASE_URL else "?"
        DATABASE_URL = f"{DATABASE_URL}{separator}sslmode=require"
    
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Models
class RosterCellModel(Base):
    __tablename__ = "roster_cells"

    id = Column(String, primary_key=True, index=True) # key: "{date}_{employee_id}"
    date = Column(String, index=True, nullable=False)
    employee_id = Column(String, index=True, nullable=False)
    employee_name = Column(String, nullable=True)
    status = Column(String, nullable=False) # WORKING, WEEKLY_OFF, PLANNED_LEAVE, SICK_LEAVE, etc.
    brand_id = Column(String, index=True, nullable=True)
    brand_name = Column(String, nullable=True)
    process_type = Column(String, nullable=True) # CS, ACC, NDR, RETENTION
    is_backup = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)

class AllocationModel(Base):
    __tablename__ = "allocations"

    id = Column(String, primary_key=True)
    employee_id = Column(String, index=True, nullable=False)
    brand_id = Column(String, index=True, nullable=False)
    process_type = Column(String, nullable=False)
    is_primary = Column(Boolean, default=True)

class LeaveRecordModel(Base):
    __tablename__ = "leave_records"

    id = Column(String, primary_key=True)
    employee_id = Column(String, index=True, nullable=False)
    date = Column(String, index=True, nullable=False)
    leave_type = Column(String, nullable=False)
    reason = Column(Text, nullable=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes tables and seeds initial data if database is empty."""
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if cells already exist
        cell_count = db.query(RosterCellModel).count()
        if cell_count == 0:
            print("Seeding initial roster cells into database (Neon/SQLite)...")
            from data.seed_data import EMPLOYEES, BRANDS, ALLOCATIONS, PUBLIC_HOLIDAYS, PRECONFIGURED_LEAVES
            from engine.scheduler import build_roster

            initial_roster = build_roster(
                year=2026,
                month=11,
                employees=EMPLOYEES,
                brands=BRANDS,
                allocations=ALLOCATIONS,
                holidays=PUBLIC_HOLIDAYS,
                leaves=PRECONFIGURED_LEAVES
            )

            # Insert cells
            for cell in initial_roster.cells:
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
            print(f"Successfully seeded {len(initial_roster.cells)} shifts into the database!")
    finally:
        db.close()
