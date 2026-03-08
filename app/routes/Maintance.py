from fastapi import HTTPException, APIRouter, Depends, Header, Response
from sqlalchemy.orm import Session
from datetime import date, timedelta
import os
from dotenv import load_dotenv

from app.core.db_config import get_db
from app.models.jobs import Job
from app.models.job_applications import JobApplication
from app.models.worker_availability import WorkerAvailability

load_dotenv()

router = APIRouter(prefix='/Maintenance', tags=['Maintenance'])

@router.delete("/DeleteExpire")
def maintenance(
    x_admin_token: str = Header(None, alias="X-Admin-Token"), 
    db: Session = Depends(get_db)
):
    """
    Cleans up expired jobs and their associated applications and availability records.
    Requires a secret key passed in the 'X-Admin-Token' header.
    """
    # 1. Authorize via Environment Variable
    admin_token = os.getenv("ADMIN_SECRET_KEY")
    if not admin_token:
        # Fallback for safety if the env var isn't set yet
        raise HTTPException(status_code=500, detail="Admin secret key not configured in environment")
        
    if not x_admin_token or x_admin_token != admin_token:
        raise HTTPException(status_code=403, detail="Unauthorized: Invalid Secret Key")

    today = date.today()

    # 2. Find Expired Job IDs
    # A job is expired if: start_date + duration_days < today
    all_jobs = db.query(Job).all()
    expired_job_ids = [
        job.id for job in all_jobs 
        if (job.start_date + timedelta(days=job.duration_days)) < today
    ]

    if not expired_job_ids:
        # Option 1: Raise exception for 404
        raise HTTPException(status_code=404, detail="No expired records found.")

    try:
        # 3. Manual Deletion in Order (Bottom-Up)
        # A. Delete applications pointing to these jobs
        deleted_apps = db.query(JobApplication).filter(JobApplication.job_id.in_(expired_job_ids)).delete(synchronize_session=False)

        # B. Delete worker availability pointing to these jobs
        deleted_avail = db.query(WorkerAvailability).filter(WorkerAvailability.job_id.in_(expired_job_ids)).delete(synchronize_session=False)

        # C. Finally, delete the jobs
        deleted_jobs = db.query(Job).filter(Job.id.in_(expired_job_ids)).delete(synchronize_session=False)

        db.commit()

        return {
            "message": "Cleanup completed successfully",
            "details": {
                "expired_jobs_removed": deleted_jobs,
                "applications_removed": deleted_apps,
                "availability_records_removed": deleted_avail
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")
