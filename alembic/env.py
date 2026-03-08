from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlalchemy.engine import Engine
from dotenv import load_dotenv
import os

load_dotenv()

from app.core.db_config import Base
from app.models import user, jobs,worker_availability,job_applications  # include all your models

target_metadata = Base.metadata

def run_migrations_offline():
    """Run migrations without DB connection (generates SQL only)"""
    url = os.getenv("DIRECT_URL")
    if not url:
        raise Exception("Missing DIRECT_URL in .env")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Run migrations with DB connection"""
    url = os.getenv("DIRECT_URL")
    if not url:
        raise Exception("Missing DIRECT_URL in .env")

    from sqlalchemy import create_engine
    connectable: Engine = create_engine(url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
