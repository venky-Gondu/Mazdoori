from fastapi import HTTPException, APIRouter, Depends
import math
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.db_config import get_db
from app.models.jobs import Job
from app.schemas.job import JobSchema
from app.models.user import User
from app.models.job_applications import JobApplication
from app.core.security import get_current_user
from app.routes.Worker_availabilty_updation import check_worker_availability, worker_availabilty_updation

router = APIRouter(prefix='/Finding', tags=['FindingJobs'])

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.get("/jobs/{worker_id}")
def find_jobs(worker_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Find nearby jobs for a worker."""
    if current_user.id != worker_id:
        raise HTTPException(status_code=403, detail="Not authorized to access these jobs")

    worker = current_user

    if worker.latitude is None or worker.longitude is None:
        raise HTTPException(status_code=400, detail="Location not available. Please enable location.")

    all_jobs = db.query(Job).all()
    matches = []
    for job in all_jobs:
        if job.latitude is not None and job.longitude is not None:
            dist = haversine(worker.latitude, worker.longitude, job.latitude, job.longitude)
            if dist <= 5.0:
                matches.append(job)

    # Fetch applied job IDs
    applied_job_ids = set(
        row[0] for row in db.query(JobApplication.job_id).filter(
            JobApplication.worker_id == worker_id
        ).all()
    )

    result = []
    for job in matches:
        job_data = JobSchema.model_validate(job).model_dump()
        job_data["already_applied"] = job.id in applied_job_ids
        result.append(job_data)

    return result

@router.post("/apply/{job_id}/{worker_id}")
def apply_for_job(job_id: UUID, worker_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Apply for a job with availability overlap check."""
    if current_user.id != worker_id:
        raise HTTPException(status_code=403, detail="Not authorized to apply on behalf of another user")

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Prevent duplicate applications
    existing = db.query(JobApplication).filter(
        JobApplication.job_id == job_id, 
        JobApplication.worker_id == worker_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already applied for this job")

    # Validate schedule availability
    conflict = check_worker_availability(worker_id, job, db)
    if conflict:
        raise HTTPException(
            status_code=409, 
            detail=f"Schedule conflict: you are already booked from {conflict.start_date} to {conflict.end_date}"
        )

    # Record application transaction
    job_application = JobApplication(job_id=job_id, worker_id=worker_id)
    db.add(job_application)
    worker_availabilty_updation(worker_id, job, db)
    db.commit()
    return {"message": "Job applied successfully"}