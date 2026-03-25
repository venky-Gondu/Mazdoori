# Mazdoori - Agricultural Labor Matching Platform

## The Problem
Agricultural labor matching in rural areas relies heavily on inefficient word-of-mouth communication. Farmers struggle to find reliable agricultural workers during peak seasons (such as harvesting and sowing), leading to reduced productivity and potential crop losses. Meanwhile, agricultural workers face inconsistent employment and lack visibility into available jobs in their immediate vicinity. There is no centralized, real-time platform designed specifically for the Indian agricultural labor sector that addresses language barriers, low technological literacy, and precise location-based matching.

## The Project
Mazdoori is a specialized digital platform that directly connects farmers with agricultural workers. It bridges the communication gap by providing a location-based job matching system where farmers can post short-term agricultural jobs, and workers can find and apply for jobs within a specific radius (e.g., 5 kilometers). The platform is built with a simple, option-oriented interface and features dual-language support (English and Hindi) to cater specifically to its target demographic, ensuring that users with minimal technical experience can navigate the app comfortably.

## Architecture
The application follows a standard Client-Server architecture designed for scalability and mobile responsiveness:
- Frontend: A Progressive Web Application (PWA) built with React.js and Vite. It utilizes Tailwind CSS for rapid styling and Framer Motion for smooth, interactive animations.
- Backend: A RESTful API built with FastAPI (Python), chosen for its high performance and asynchronous capabilities.
- Database: PostgreSQL, managed and queried via the SQLAlchemy Object Relational Mapper (ORM).
- Authentication: Secure session management using JSON Web Tokens (JWT) combined with a One Time Password (OTP) based login flow, powered by the open-source TextBee SMS gateway.

## Highlights
- Role-Based Access Control: Distinct dashboards, interfaces, and functionalities tailored specifically for Farmers and Workers.
- Location-Based Job Matching: Utilizes the Haversine formula on the backend to accurately calculate distances and display jobs to workers only if they are within a 5-kilometer radius.
- Option-Oriented User Interface: Designed to require minimal typing. Users interact primarily through predefined visual options and buttons.
- Real-Time Status Tracking: Workers have a dedicated tab to see the live status of their applications (Pending, Accepted, or Rejected).
- Concurrency and Double-Submit Prevention: Implements both frontend UI constraints (disabling buttons) and database-level collision checks returning 409 Conflict errors to prevent duplicate applications.
- Query Optimization: The backend is optimized to eliminate N+1 query problems by using batch fetching, ensuring fast load times even as the user base scales.

## Workflow and Process Flow

### 1. Registration and Authentication
- The user enters their mobile phone number on the login screen.
- The system checks the database to see if the user already exists. If yes, it logs them in immediately and redirects them to their respective dashboard.
- If the user is new, the system generates a 6-digit OTP and sends it via the TextBee SMS gateway.
- The user inputs the OTP. Upon successful verification, they are prompted to select their role (Farmer or Worker).
- The system captures the user's GPS coordinates (latitude and longitude) and completes the registration process.

### 2. Farmer Flow
- The farmer logs into the application and is directed to the Farmer Dashboard.
- To create a new job, the farmer clicks a category block and navigates a step-by-step modal, selecting the work type, required number of workers, job duration, start date, location, and daily wage.
- Once submitted, the job is securely recorded in the database and immediately becomes visible to matched nearby workers.
- The farmer can monitor active job postings. When workers apply, an applicant counter increments.
- The farmer clicks the "Applicants" button to open a modal detailing the workers who have applied.
- The farmer reviews the applicant's phone number and clicks "Accept" or "Reject". This action updates the application status in the database.

### 3. Worker Flow
- The worker logs into the application and is directed to the Worker Dashboard, defaulting to the "Browse Jobs" tab.
- The backend calculates distances and populates the dashboard with farm jobs available within a strict 5-kilometer radius of the worker's location.
- The worker browses the job cards, reviewing details such as daily wage, duration, and distance.
- The worker clicks "Apply" on a desired job. The system checks their availability schedule to ensure no date overlaps occur before confirming the application.
- The worker can switch to the "My Applications" tab at any time to track whether their applications have been Accepted, Rejected, or are still Pending.

## Endpoints

| Endpoint | HTTP Method | Allowed Role | Description |
|---|---|---|---|
| /userauth/check_phone | POST | Any | Checks if a phone number exists. Sends an OTP if new, or returns a JWT if existing. |
| /userauth/verify-register | POST | Any | Verifies the OTP and registers a new user, returning a JWT upon success. |
| /Jobs/CreateJob | POST | Farmer | Creates a new agricultural job posting in the database. |
| /Jobs/UserJobs/{user_id} | GET | Farmer | Retrieves all jobs posted by a specific farmer, including dynamic applicant counts. |
| /Jobs/Applicants/{job_id} | GET | Farmer | Retrieves a list of all workers who have applied for a specific job. |
| /Jobs/UpdateJobApplicationStatus/{id} | PUT | Farmer | Updates the status of a specific job application to either approved or rejected. |
| /Finding/jobs/{worker_id} | GET | Worker | Retrieves a list of nearby jobs for a worker based on geographic coordinates. |
| /Finding/apply/{job_id}/{worker_id} | POST | Worker | Submits a worker's application for a specific job, including schedule validation. |
| /Jobs/MyApplications/{worker_id} | GET | Worker | Retrieves a historical list of all applications submitted by a specific worker. |

## Setup and Requirements

### Prerequisites
- Python 3.9 or higher
- Node.js 18 or higher
- PostgreSQL Database Server

### Backend Setup
1. Open a terminal and navigate to the root directory of the project.
2. Create an isolated Python virtual environment: `python -m venv venv`
3. Activate the virtual environment.
4. Install all required Python dependencies: `pip install -r requirements.txt`
5. Configure the environment variables by creating a `.env` file (refer to the Environment Variables section below).
6. Start the FastAPI backend server: `uvicorn app.main:app --reload --host 0.0.0.0`
7. The API will be accessible at `http://localhost:8000`.

### Frontend Setup
1. Open a new terminal and navigate to the `app-frontend` directory.
2. Install all required Node packages: `npm install`
3. Start the Vite development server: `npm run dev -- --host`
4. The web application will be accessible at `http://localhost:5173`.

### Database Synchronization
Whenever you set up the project for the first time or pull new changes, ensure your PostgreSQL database schema includes all necessary columns by running the synchronization script from the root directory:
`python sync_db.py`

## Environment Variables

Create a file named `.env` in the root directory and populate it with the necessary configurations.

| Variable Name | Description | Example Value |
|---|---|---|
| DATABASE_URL | The full connection string for the PostgreSQL database. | postgresql://username:password@localhost:5432/mazdoori |
| SECRET_KEY | A strong cryptographic key used for signing JSON Web Tokens. | your_very_long_secret_key_here |
| ALGORITHM | The hashing algorithm used for JWT generation. | HS256 |
| ACCESS_TOKEN_EXPIRE_MINUTES | The lifespan of a JWT in minutes before it expires. | 1440 |
| TEXTBEE_API_KEY | The API key assigned by the TextBee platform for your account. | your_textbee_api_key_here |
| TEXTBEE_DEVICE_ID | The unique device identifier registered in your TextBee dashboard. | your_textbee_device_id_here |

## Upcoming Features
- Profile Management: Allowing users to add specific skills, past agricultural experience, and profile pictures to build a reputation.
- In-App Messaging: A localized chat system permitting direct communication between farmers and workers once an application is accepted.
- Rating and Review System: Building community trust by allowing farmers and workers to rate their experience with each other after a job's duration is completed.
- Push Notifications: Implementing web push alerts to notify workers instantly when a new job is posted nearby, and to notify farmers the moment a worker applies.
- Multilingual Voice Support: Integrating basic voice-to-text and text-to-speech capabilities to assist users who struggle with reading text on the screen.
- Offline Capability and Caching: Enhancing the Service Worker to allow workers to browse previously fetched jobs even when cellular internet connectivity drops in remote fields.
