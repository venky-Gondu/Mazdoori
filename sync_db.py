import os
from sqlalchemy import text, create_engine
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ Error: DATABASE_URL not found in .env")
    exit(1)

engine = create_engine(DATABASE_URL)

def sync_schema():
    with engine.connect() as conn:
        print("🔍 Checking database schema...")
        
        # Add latitude/longitude to users
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude FLOAT;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude FLOAT;"))
            conn.commit()
            print("✅ Users table updated (latitude/longitude added if missing)")
        except Exception as e:
            print(f"⚠️ Users table sync: {e}")

        # Add latitude/longitude to jobs
        try:
            conn.execute(text("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS latitude FLOAT;"))
            conn.execute(text("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS longitude FLOAT;"))
            conn.commit()
            print("✅ Jobs table updated (latitude/longitude added if missing)")
        except Exception as e:
            print(f"⚠️ Jobs table sync: {e}")

        # Ensure job_applications table exists (FastAPI create_all handles this mostly, but good to be sure)
        print("✅ Core schema checks complete.")

if __name__ == "__main__":
    sync_schema()
