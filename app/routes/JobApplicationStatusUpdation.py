from fastapi import HTTPException, APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.db_config import get_db
from app.models.job_applications import JobApplication
from app.schemas.application import JobApplicationSchema, ApplicationStatusEnum
from app.models.user import User
from app.models.jobs import Job
from app.schemas.job import JobSchema
from app.core.security import get_current_user

router = APIRouter(prefix='/Jobs', tags=['Job'])

@router.get("/UserJobs/{user_id}")
def get_farmers_jobs(user_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access these jobs")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Compare with string value as stored in DB
    if user.role.value != "FARMER": 
        raise HTTPException(status_code=403, detail="User is not a farmer")
    jobs = db.query(Job).filter(Job.farmer_id == user_id).all()
    return [JobSchema.model_validate(job) for job in jobs]

@router.put("/UpdateJobApplicationStatus/{job_application_id}")
def update_job_application_status(job_application_id: UUID, status: ApplicationStatusEnum, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job_application = db.query(JobApplication).filter(JobApplication.id == job_application_id).first()
    if not job_application:
        raise HTTPException(status_code=404, detail="Job application not found")
        
    # Security check: Ensure the status update is done by the farmer who owns the job
    job = db.query(Job).filter(Job.id == job_application.job_id).first()
    if not job or job.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this application status")

    job_application.status = status
    db.commit()
    db.refresh(job_application)
    return JobApplicationSchema.model_validate(job_application)
