# DataStraw Smart Roster Management System 🚀

An intelligent, constraint-aware operations scheduling platform engineered for multi-brand D2C operational pods, client SLA enforcement, and real-time conflict mitigation.

Built for the **DataStraw Tech Hiring Assessment**.

---

## 🌟 Key Capabilities & Architectural Highlights

- **FastAPI (Python) Constraint & Validation Engine**: Clean decoupled domain logic separating operations business rules from presentation layers.
- **Realistic 32-Employee & 16-Brand Dataset**:
  - **4 Operational Pods** (Alpha, Beta, Gamma, Delta) overseen by designated **Pod Leads**.
  - **~81% Dedicated Single-Resource Brands** (13 brands managed by 1 sole resource).
  - **~19% Multi-Resource Brands** (3 brands staffed by staggered 2–3 associates).
  - Multi-process coverage across **Customer Support (CS)**, **Abandoned Cart Conversions (ACC)**, **Non-Delivery Report Management (NDR)**, and **Customer Retention**.
- **5 Comprehensive Stakeholder Views (Section 3E)**:
  1. **Company Master Matrix**: Full 32-staff × 30-day interactive matrix with color-coded status badges and sticky headers.
  2. **Pod-wise View**: Grouped by Pod Lead, showing team capacity, pod brands, and cross-coverage readiness.
  3. **Brand-wise View**: 30-day SLA status grid (Shields for covered days vs. Red alerts for coverage gaps).
  4. **Process-wise View**: Real-time daily headcount distribution and capacity charts across November.
  5. **Employee-wise View**: Individual monthly shift breakdown, workload balance, and fatigue monitoring.
- **Handling Changes / What-If Simulator (Section 3F)**:
  - Simulate an associate's emergency sick leave on any date.
  - Instantly evaluates whether the brand can sustain the shift or creates a critical gap.
  - Automatically identifies available cross-trained Pod peers or Pod Leads as recommended backups.
- **1-Click Conflict Resolution**:
  - Live Conflict Drawer auditing business SLA gaps, fatigue limits (>6 consecutive days), and leave conflicts.
  - Deploy recommended pod backups directly with a single click.
- **CSV Roster Export**: One-click export of the complete monthly roster.

---

## 🏗️ System Architecture

```text
datastraws/
├── backend/
│   ├── main.py                     # FastAPI entrypoint with CORS & routes mounted
│   ├── requirements.txt            # Python dependencies (FastAPI, Pydantic, Uvicorn)
│   ├── models/
│   │   └── schemas.py              # Pydantic schemas (Employee, Brand, Shift, Conflict)
│   ├── data/
│   │   └── seed_data.py            # Master dataset (32 employees, 16 brands, 4 pods)
│   ├── engine/
│   │   ├── scheduler.py            # Constraint-aware monthly generation engine
│   │   ├── validator.py            # Multi-level conflict audit & SLA gap detector
│   │   └── resolver.py             # Heuristic pod backup recommendation solver
│   └── routes/
│       ├── master_data.py          # Master data CRUD & dynamic reassignment APIs
│       ├── roster.py               # Active roster generation, manual cell edit & 1-click fixes
│       └── simulation.py           # Section 3F change impact simulation endpoint
├── frontend/
│   ├── src/
│   │   ├── api.js                  # Frontend API client
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Live SLA Health badge, Conflicts pill & actions
│   │   │   ├── ConflictDrawer.jsx  # Slide-over conflict audit & 1-click resolution
│   │   │   ├── SimulationModal.jsx # Section 3F What-If leave simulation modal
│   │   │   ├── CellEditModal.jsx   # Quick shift override modal
│   │   │   └── views/
│   │   │       ├── CompanyView.jsx # 32-employee master calendar matrix
│   │   │       ├── PodView.jsx     # Pod teams, leads, and capacity
│   │   │       ├── BrandView.jsx   # 30-day brand coverage & SLA shields
│   │   │       ├── ProcessView.jsx # CS / ACC / NDR daily headcount distribution
│   │   │       └── EmployeeView.jsx# Individual shift schedule & fatigue compliance
│   │   ├── App.jsx                 # Central application state & tab manager
│   │   └── index.css               # Modern Tailwind styling & responsive variables
│   ├── vite.config.js              # Vite bundler with proxy to FastAPI backend
│   └── package.json
└── README.md                       # Complete documentation & Section 8 answers
```

---

## ⚡ Quickstart & Local Setup

### Prerequisites
- Python 3.10+ (or `uv`)
- Node.js 18+ and `npm`

### 1. Start the FastAPI Backend
```bash
# Navigate to backend directory
cd backend

# Create virtual environment and install dependencies
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt

# Start FastAPI server on port 8000
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- Interactive Swagger API Documentation: `http://127.0.0.1:8000/docs`

### 2. Start the React Frontend
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
- Open `http://localhost:5173/` (or `http://localhost:5174/`) in your browser.

---

## 🐳 Run with Docker & Docker Compose (1-Command Setup)

You can launch both the FastAPI backend and React frontend production containers with a single command:

```bash
# Clone the repository
git clone https://github.com/ramashishmaurya/datastraw.git
cd datastraw

# Run entire stack in Docker
docker compose up --build
```

- **Frontend Application:** `http://localhost:3000` (Served via high-performance NGINX)
- **FastAPI Backend & Swagger Docs:** `http://localhost:8000/docs`

---

## 🔄 CI/CD Pipeline (GitHub Actions)

This repository includes a production-grade automated CI/CD pipeline defined in `.github/workflows/ci-cd.yml`:
1. **Backend CI**: Automated syntax, import, and dependency verification on Python 3.11.
2. **Frontend CI**: Automatic npm dependency installation, linting, and Vite production bundle compilation on Node 20.
3. **Docker Build Validation**: Validates that both backend and frontend Docker containers build successfully on every PR and push to `main`.

---

## 🧠 Section 8: Tell Us How You Think

### 1. How did you model employees, brands, processes, pods, and their relationships?
We implemented a normalized relational model using Pydantic schemas in `backend/models/schemas.py`:
- **Pods** act as organizational clusters led by a designated `lead_id`.
- **Brands** belong to a Pod and define their client `OperatingModel` (`365_DAYS`, `MON_SAT_NO_HOLIDAYS`, `MON_FRI_NO_HOLIDAYS`) and child `ProcessRequirements` (specifying `min_staff`, Sunday operation, and holiday operation).
- **Employees** belong to a Pod and possess certified skills (`ProcessType`: CS, ACC, NDR, Retention) and personal scheduling preferences (`weekly_off_preference`).
- An explicit **Allocation** join entity decouples employee work schedules from brand operating rules, defining primary vs. secondary/backup relationships.

### 2. How does your system generate a roster and determine whether it satisfies the required constraints?
The generation logic (`backend/engine/scheduler.py`) uses a two-stage deterministic constraint solver:
1. **Generation Stage**:
   - Locks hard unavailabilities (approved leaves, comp-offs, and public holidays where the brand is closed).
   - Schedules single-resource brands prioritizing client coverage while enforcing statutory weekly offs.
   - For multi-resource brands, rotates and staggers weekly offs across the team so minimum daily headcount is maintained 365 days a year.
2. **Audit Stage (`validator.py`)**:
   - Exhaustively iterates over every `(Date × Brand × Process)` tuple. If active staffing < `min_staff`, it flags a `COVERAGE_GAP`.
   - Iterates across each employee's schedule. If consecutive working days exceed `max_consecutive_days` (6 days), it flags a `FATIGUE_EXCEEDED` warning.
   - Cross-checks approved leave dates against working assignments to prevent `LEAVE_VIOLATION`.

### 3. How did you handle the difference between single-resource brands and brands with multiple employees?
- **Single-Resource Brands (~80%)**: The primary employee is a single point of failure (SPOF). When this employee takes a statutory weekly off or approved leave on a 365-day brand, the system explicitly detects the resulting coverage gap. Rather than failing silently, the solver triggers `find_best_backup()` to locate an available, cross-trained peer within the same Pod or recommends the Pod Lead.
- **Multi-Resource Brands (~20%)**: The system distributes shift schedules across assigned team members (e.g., Member A takes Sunday off, Member B takes Wednesday off). If one associate is absent, the solver evaluates whether the remaining assigned peers can sustain the required minimum headcount before escalating.

### 4. What happens when an employee manages all processes for a brand but is unavailable on a required working day?
The system flags a high-priority `CRITICAL_COVERAGE_GAP` with an explanatory message. It then queries the Pod's capacity pool:
1. Searches for peers in the same Pod who possess matching process certifications (e.g. CS or NDR).
2. Checks who is unassigned or working on a brand that is closed on that day (e.g., a Mon–Fri brand associate free on the weekend).
3. Evaluates the Pod Lead as a high-readiness fallback.
4. Surfacing the recommended candidate in the Conflict Drawer with a 1-click **"Deploy Backup"** action for manager authorization.

### 5. How does your system handle conflicting requirements or insufficient staffing?
We enforce a strict constraint hierarchy:
- **Hard Constraints (Never silently broken)**: Mandatory client operating days, approved leaves, and no double-booking.
- **Soft Constraints (Optimized where feasible)**: Preferred weekly-off days and equitable weekend distributions.
When insufficient staffing makes a requirement impossible to fulfill, the engine does not generate an invalid or fabricated schedule. It generates the best valid schedule up to available capacity, flags the deficit in red, and provides an actionable gap report detailing the exact date and shortfall.

### 6. Which parts of the process did you automate, and which did you leave under human control? Why?
- **Automated**: Repetitive shift generation, rotation of weekly offs, public holiday policy enforcement, fatigue streak calculation, and real-time gap detection.
- **Human Control**: Final authorization of emergency shift swaps, cross-pod reallocations, and leave approvals. Operations management involves subjective client nuance, personal employee emergencies, and contract flexibility that an algorithm should inform with recommendations, but never unilaterally dictate without manager oversight.

### 7. If the company doubled its team and brand count, what would you change about your solution?
1. **Transition to a Mathematical Optimization Solver**: Incorporate Google OR-Tools (CP-SAT) or Integer Linear Programming (PuLP) in the backend to find globally optimal schedules for complex soft constraint combinations.
2. **Asynchronous Generation via Task Queues**: Offload roster generation to background workers (Celery/Redis or BullMQ) with WebSockets pushing updates to the UI.
3. **Role-Based Access Control (RBAC)**: Partition views so Pod Leads manage and approve their respective pods while Operations Managers supervise company-wide master rosters.

### 8. If you had one additional week to work on this, what would you improve first?
1. **Automated Compensatory Off Ledger**: Automatically credit and track comp-offs when employees work festival shifts or cover emergency pod backups.
2. **Peer-to-Peer Shift Swap Workflow**: Enable employees to initiate shift swap requests with peer verification and 1-click Pod Lead approval.
3. **External Calendar & Slack Integrations**: Generate iCal feeds and daily Slack morning briefings (`/today-roster`) notifying pod leads of active daily coverage.

---

## 📽️ Demo Walkthrough Video Outline (3–5 Minutes)

1. **Introduction (30s)**: High-level overview of the problem — multi-brand operational pods, 80% single-resource constraint, and why manual Excel fails.
2. **Master Roster & Stakeholder Views (90s)**:
   - Walk through the **Company Master View** (32 staff × 30 days).
   - Demonstrate the **Pod View** highlighting Pod Leads and capacity.
   - Showcase the **Brand SLA Coverage View** with daily green/red shield indicators.
   - Show the **Process View** daily headcount chart and **Employee View** fatigue streak compliance.
3. **Conflict Detection & 1-Click Resolution (60s)**:
   - Open the **Conflicts Drawer**, show a critical gap on a 365-day single-resource brand.
   - Explain the algorithmic recommendation.
   - Click **"Deploy Backup"** and watch the conflict resolve in real time.
4. **Handling Changes Simulation (60s)**:
   - Open **Simulate Change** modal.
   - Select an employee (e.g. Aarav Patel) and mark Emergency Sick Leave on Nov 18.
   - Show the resulting coverage gap detection and automatic Pod Lead backup recommendation.
   - Apply to live roster and verify real-time update.
