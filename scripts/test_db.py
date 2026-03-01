import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from backend.db import SessionLocal
from backend.models import User

print("Testing DB connection...")
try:
    session = SessionLocal()
    print("Session created.")
    count = session.query(User).count()
    print(f"Current users count: {count}")
    session.close()
    print("Done.")
except Exception as e:
    print(f"Error: {e}")
