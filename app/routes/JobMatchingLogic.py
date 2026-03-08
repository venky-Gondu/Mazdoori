from fastapi import HTTPException, Request, APIRouter, Depends
import math
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.db_config import get_db
from app.models.jobs import Job
from app.schemas.job import JobSchema
from app.models.user import User
from app.models.job_applications import JobApplication
from app.models.worker_availability import WorkerAvailability
from app.routes.Worker_availabilty_updation import check_worker_availability, worker_availabilty_updation
from app.core.security import get_current_user

router = APIRouter(prefix='/Finding', tags=['FindingJobs'])

def haversine(lat1, lon1, lat2, lon2):
    # Radius of the Earth in km
    R = 6371.0
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return distance

@router.get("/jobs/{Worker_id}")
def find_jobs(Worker_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify the user is requesting their own jobs or is authorized
    if current_user.id != Worker_id:
        raise HTTPException(status_code=403, detail="Not authorized to access these jobs")
        
    worker = db.query(User).filter(User.id == Worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    
    # If worker doesn't have coordinates, we can't do radius search
    if worker.latitude is None or worker.longitude is None:
        # Fallback to location string matching if coordinates are missing
        matches = db.query(Job).filter(Job.location == worker.location).all()
    else:
        all_jobs = db.query(Job).all()
        matches = []
        for job in all_jobs:
            if job.latitude is not None and job.longitude is not None:
                dist = haversine(worker.latitude, worker.longitude, job.latitude, job.longitude)
                if dist <= 5.0:
                    matches.append(job)
            elif job.location == worker.location:
                # Fallback for jobs without coordinates
                matches.append(job)
    
    return [JobSchema.model_validate(match) for match in matches]

@router.post("/apply/{job_id}/{worker_id}")
def apply_for_job(job_id: UUID, worker_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != worker_id:
        raise HTTPException(status_code=403, detail="Not authorized to apply on behalf of another user")
        
    job = db.query(Job).filter(Job.id == job_id).first()
    worker = db.query(User).filter(User.id == worker_id).first()
    
    if not job or not worker:
        raise HTTPException(status_code=404, detail="Job or Worker not found")
    
    # Check for Worker Availability
    # Note: check_worker_availability is a helper function, not a dependency here
    avail = check_worker_availability(worker_id, db)
    if not avail:
        raise HTTPException(status_code=404, detail="Worker not available")
        
    # Check if already applied
    existing = db.query(JobApplication).filter(
        JobApplication.job_id == job_id, 
        JobApplication.worker_id == worker_id
    ).first()
    if existing:
        return {"message": "Already applied for this job"}

    job_application = JobApplication(job_id=job_id, worker_id=worker_id)
    
    # Update worker availability to busy/scheduled
    worker_availabilty_updation(worker_id, job_id, db)
    
    db.add(job_application)
    db.commit()
    return {"message": "Job applied successfully"}