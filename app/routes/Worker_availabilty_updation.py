from fastapi import HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from app.models.worker_availability import WorkerAvailability
from app.models.jobs import Job

def worker_availabilty_updation(worker_id: UUID, Job_id: UUID, db: Session):
    job = db.query(Job).filter(Job.id == Job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    worker_availability = WorkerAvailability(
        worker_id=worker_id, 
        job_id=Job_id, 
        start_date=job.start_date, 
        end_date=job.start_date
    )
    db.add(worker_availability)
    db.commit()
    return {"message": "Worker Availability updated successfully"}

def check_worker_availability(worker_id: UUID, db: Session):
    currdate = datetime.now().date()
    worker_availability = db.query(WorkerAvailability).filter(
        WorkerAvailability.worker_id == worker_id,
        WorkerAvailability.start_date <= currdate,
        WorkerAvailability.end_date >= currdate
    ).first()
    return worker_availability
