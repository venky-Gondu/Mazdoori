from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import userauth, Maintance, JobMatchingLogic, JobApplicationStatusUpdation
from app.core.db_config import engine, Base
# Import all models to register them with Base
from app.models.user import User
from app.models.jobs import Job
from app.models.job_applications import JobApplication
from app.models.worker_availability import WorkerAvailability


app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
Base.metadata.create_all(bind=engine)
app.include_router(userauth.router)
app.include_router(Maintance.router)
app.include_router(JobMatchingLogic.router)
app.include_router(JobApplicationStatusUpdation.router)