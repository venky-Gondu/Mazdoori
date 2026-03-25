from fastapi import HTTPException, APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from app.core.db_config import get_db
from app.models.job_applications import JobApplication, ApplicationStatus
from app.schemas.application import JobApplicationSchema, ApplicationStatusEnum
from app.models.user import User
from app.models.jobs import Job
from app.schemas.job import JobSchema, JobCreateSchema
from app.core.security import get_current_user

router = APIRouter(prefix='/Jobs', tags=['Job'])

@router.post("/CreateJob", response_model=JobSchema)
def create_job(job_data: JobCreateSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new job posting. Only FARMER role users can create jobs."""
    if current_user.role.value != "FARMER":
        raise HTTPException(status_code=403, detail="Only farmers can post jobs")
    
    new_job = Job(
        farmer_id=current_user.id,
        work_types=job_data.work_types,
        location=job_data.location,
        required_workers=job_data.required_workers,
        start_date=job_data.start_date,
        duration_days=job_data.duration_days,
        wage_per_day=job_data.wage_per_day,
        latitude=job_data.latitude or current_user.latitude,
        longitude=job_data.longitude or current_user.longitude
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return JobSchema.model_validate(new_job)

@router.get("/UserJobs/{user_id}")
def get_farmers_jobs(user_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all jobs posted by a farmer with applicant counts."""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access these jobs")
    if current_user.role.value != "FARMER": 
        raise HTTPException(status_code=403, detail="User is not a farmer")

    jobs = db.query(Job).filter(Job.farmer_id == user_id).all()
    
    # Fetch application counts
    job_ids = [job.id for job in jobs]
    app_counts = {}
    if job_ids:
        counts = db.query(
            JobApplication.job_id, func.count(JobApplication.id)
        ).filter(JobApplication.job_id.in_(job_ids)).group_by(JobApplication.job_id).all()
        app_counts = dict(counts)

    result = []
    for job in jobs:
        job_data = JobSchema.model_validate(job).model_dump()
        job_data["applicant_count"] = app_counts.get(job.id, 0)
        result.append(job_data)

    return result

@router.get("/Applicants/{job_id}")
def get_job_applicants(job_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all applicants for a specific job. Only the owning farmer can view."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view applicants for this job")

    applications = db.query(JobApplication).filter(JobApplication.job_id == job_id).all()
    
    # Fetch worker details
    worker_ids = [app.worker_id for app in applications]
    workers = {}
    if worker_ids:
        worker_rows = db.query(User).filter(User.id.in_(worker_ids)).all()
        workers = {w.id: w for w in worker_rows}

    result = []
    for app in applications:
        worker = workers.get(app.worker_id)
        result.append({
            "application_id": str(app.id),
            "worker_id": str(app.worker_id),
            "worker_phone": worker.phone if worker else "Unknown",
            "status": app.status.value if app.status else "pending"
        })
    return result

@router.put("/UpdateJobApplicationStatus/{job_application_id}")
def update_job_application_status(
    job_application_id: UUID, 
    status: ApplicationStatusEnum, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Accept or reject a worker application. Only the owning farmer can update."""
    job_application = db.query(JobApplication).filter(JobApplication.id == job_application_id).first()
    if not job_application:
        raise HTTPException(status_code=404, detail="Job application not found")
        
    job = db.query(Job).filter(Job.id == job_application.job_id).first()
    if not job or job.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this application status")

    job_application.status = ApplicationStatus(status.value)
    db.commit()
    db.refresh(job_application)
    return JobApplicationSchema.model_validate(job_application)

@router.get("/MyApplications/{worker_id}")
def get_worker_applications(worker_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all applications for a worker with their current status."""
    if current_user.id != worker_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    applications = db.query(JobApplication).filter(JobApplication.worker_id == worker_id).all()
    
    # Fetch job details
    job_ids = [app.job_id for app in applications]
    jobs = {}
    if job_ids:
        job_rows = db.query(Job).filter(Job.id.in_(job_ids)).all()
        jobs = {j.id: j for j in job_rows}

    result = []
    for app in applications:
        job = jobs.get(app.job_id)
        result.append({
            "application_id": str(app.id),
            "job_id": str(app.job_id),
            "work_types": job.work_types if job else [],
            "location": job.location if job else "Unknown",
            "wage_per_day": job.wage_per_day if job else None,
            "status": app.status.value if app.status else "pending"
        })
    return result
