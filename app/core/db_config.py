from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL= os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db():
    try:
        db = SessionLocal()
        print("✅ DB session created")
        yield db
    except Exception as e:
        print(f"❌ Error during DB session context: {e}")
        raise e
    finally:
        db.close()
        print("🔒 DB session closed")

