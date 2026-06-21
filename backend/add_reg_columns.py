import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from app.database import execute

if __name__ == "__main__":
    try:
        execute("ALTER TABLE registrations ADD COLUMN IF NOT EXISTS degree VARCHAR;")
        execute("ALTER TABLE registrations ADD COLUMN IF NOT EXISTS phone VARCHAR;")
        execute("ALTER TABLE registrations ADD COLUMN IF NOT EXISTS gender VARCHAR;")
        print("Registration columns added successfully!")
    except Exception as e:
        print("Error:", e)
