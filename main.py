import os
import sys
import subprocess

def main():
    print("==========================================================")
    print("   DataStraw Smart Roster Management System Launcher      ")
    print("==========================================================")
    print("1. Starting FastAPI backend on http://127.0.0.1:8000 ...")
    print("   Swagger Docs: http://127.0.0.1:8000/docs")
    print("2. Starting React frontend on http://localhost:5173 ...")
    print("==========================================================")
    
    backend_dir = os.path.join(os.path.dirname(__file__), "backend")
    frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
    
    # Run backend
    cmd = [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"]
    subprocess.run(cmd, cwd=backend_dir)

if __name__ == "__main__":
    main()
