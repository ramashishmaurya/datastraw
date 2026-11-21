from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.master_data import router as master_data_router
from routes.roster import router as roster_router
from routes.simulation import router as simulation_router
from database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed if empty
    init_db()
    yield

app = FastAPI(
    title="DataStraw Smart Roster Management System API",
    description="Intelligent Constraint-Based Roster Generation, Conflict Detection & Pod Capacity Management Engine",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(master_data_router)
app.include_router(roster_router)
app.include_router(simulation_router)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "DataStraw Smart Roster Engine",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
