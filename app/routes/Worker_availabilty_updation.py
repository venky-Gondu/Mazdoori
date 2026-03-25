from fastapi import HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import timedelta
from app.models.worker_availability import WorkerAvailability
from app.models.jobs import Job


def check_worker_availability(worker_id: UUID, job: Job, db: Session):
    """
    Check if a worker's schedule overlaps with a new job's date range.
    Returns the conflicting WorkerAvailability record if overlap found, else None.
    """
    job_start = job.start_date
    job_end = job.start_date + timedelta(days=job.duration_days - 1)

    # Find existing overlapping availability
    conflict = db.query(WorkerAvailability).filter(
        WorkerAvailability.worker_id == worker_id,
        WorkerAvailability.start_date <= job_end,
        WorkerAvailability.end_date >= job_start
    ).first()

    return conflict


def worker_availabilty_updation(worker_id: UUID, job: Job, db: Session):
    """
    Record that a worker is booked for a job's full date range.
    Accepts the Job object directly to avoid re-querying.
    """
    worker_availability = WorkerAvailability(
        worker_id=worker_id,
        job_id=job.id,
        start_date=job.start_date,
        end_date=job.start_date + timedelta(days=job.duration_days - 1)
    )
    db.add(worker_availability)
    return {"message": "Worker Availability updated successfully"}
