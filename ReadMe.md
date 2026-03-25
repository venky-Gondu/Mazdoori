# Mazdoori: Agricultural Labor Matching Platform

## 1. Executive Summary
Mazdoori is a specialized, location-based digital platform engineered to connect agricultural farm owners (Farmers) with daily-wage agricultural laborers (Workers). By leveraging geospatial calculations and an option-oriented, dual-language (Hindi/English) interface, the system digitizes the traditionally word-of-mouth agricultural hiring process. The platform ensures reliable labor sourcing for farmers preventing crop-cycle delays, while providing workers with consistent, localized employment visibility.

---

## 2. Problem Statement & Solution

### The Problem
The agricultural sector in rural India suffers from a severe communication gap between labor supply and demand. 
* **For Farmers**: Finding laborers during critical, time-sensitive seasons (like harvesting or sowing) relies on inefficient networks, often resulting in unharvested crops or delayed cycles.
* **For Workers**: Laborers lack a centralized medium to view available jobs. Employment discovery is restricted to immediate acquaintances, resulting in underemployment despite high demand in nearby villages.
* **Digital Limitations**: Existing job-portal solutions fail due to high literacy requirements, complex form-filling, and a lack of hyper-local (village-level) geospatial filtering.

### The Solution: Mazdoori
Mazdoori solves this by acting as a hyperlocal matchmaking engine tailored strictly for the agricultural demographic.
* **Geospatial Matching**: Workers only see jobs posted within a precise 5-kilometer radius of their current location using Haversine formula calculations.
* **Frictionless UI**: The interface eliminates complex typing. Jobs are constructed and applied for using purely visual, icon-driven buttons (e.g., "Harvest", "5 Days", "Apply").
* **Transparent Lifecycle**: The platform manages the application state in real-time, allowing farmers to explicitly Accept or Reject applications, instantly notifying the worker.

---

## 3. Application Interfaces & User Interactions

The application layout is highly optimized for progressive web app (PWA) mobile usage.

### Welcome & Authentication
Users are greeted with a minimal login screen. Authentication relies on instant OTPs via the TextBee SMS Gateway, removing the need for password memorization.

![App Home Page](Assets/App_Home_Page.png)

### Farmer Dashboard & Job Posting
Farmers are presented with a streamlined dashboard showing active postings. To create a job, they follow an intuitive, touch-friendly wizard requiring zero keyboard input, selecting crop types, required workers, and duration.

![Farmer Home Page](Assets/Farmer_Home_Page.png)
![Job Posting](Assets/JobPosting-1.png)

### Worker Dashboard
Workers view a localized feed of jobs strictly within their 5KM radius. The dashboard features distinct tabs separating "Available Jobs" from "My Applications" for clear status tracking.

![Worker Home Page](Assets/Worker_Home_page.png)

---

## 4. System Architecture & Database Design

The system employs a decoupled, API-driven Client-Server architecture.
* **Frontend**: React.js structured with Vite, utilizing TailwindCSS.
* **Backend**: FastAPI (Python) functioning asynchronously to handle high-throughput requests.
* **Authentication**: JWT-based stateless sessions enforcing strict 24-hour expiration cycles.

### Database Design
The relational database strictly enforces data integrity across users, jobs, and applications. 

![Database Schema](Assets/DBSCHEMADESIGN.png)

**Key Entities:**
1. **Users Table**: Stores generic user profiles, geospatial coordinates (`latitude`, `longitude`), and Enum-based Roles (`FARMER`, `WORKER`).
2. **Jobs Table**: Linked natively to a Farmer ID. Contains spatial coordinates, wage structures, and Enum arrays of required work types.
3. **Job Applications Table**: A junction entity linking `worker_id` and `job_id`, governed by a strict state machine (`PENDING`, `APPROVED`, `REJECTED`).
4. **Worker Availability Table**: Tracks scheduled blocks to prevent a worker from double-booking overlapping dates.

---

## 5. Functional Process Flow

### Role: Farmer
1. **Creation**: The farmer initiates a job request via the Quick Action panel.
2. **Configuration**: Selects the task parameters (Sowing/Harvesting), duration, headcount, and wage.
3. **Publishing**: The FastAPI backend records the job, tagging the farmer's GPS coordinates.
4. **Applicant Management**: The farmer monitors incoming applications. Upon review, they trigger the `UpdateJobApplicationStatus` endpoint to transition the application to `APPROVED` or `REJECTED`.

### Role: Worker
1. **Discovery**: Upon login, the frontend requests `GET /Finding/jobs/{worker_id}`.
2. **Filtering**: The backend parses all active jobs, calculates the Haversine distance against the worker's coordinates, and yields jobs within the ≤ 5.0 KM threshold.
3. **Application**: The worker triggers `POST /Finding/apply`. The system strictly validates duplicate submissions (409 Conflict) and schedule overlaps before committing the application.

---

## 6. Comprehensive API Reference

| Scope | Endpoint | HTTP | Description |
|---|---|---|---|
| **Auth** | `/userauth/check_phone` | `POST` | Validates mobile number existance. Fires OTP if unregistered. |
| **Auth** | `/userauth/verify-register` | `POST` | Validates OTP payload, registers user coordinates, yields Access Token. |
| **Farmer** | `/Jobs/CreateJob` | `POST` | Hydrates a new job entity in PostgreSQL. |
| **Farmer** | `/Jobs/UserJobs/{uid}` | `GET` | Fetches active postings alongside batch-calculated application counts. |
| **Farmer** | `/Jobs/Applicants/{jid}` | `GET` | Yields all pending and resolved applications for a specific job ID. |
| **Farmer** | `/Jobs/UpdateJobApplicationStatus` | `PUT` | State transition endpoint (`pending` → `approved`/`rejected`). |
| **Worker** | `/Finding/jobs/{uid}` | `GET` | Generates the geospatial 5KM proximity feed. |
| **Worker** | `/Finding/apply/{jid}/{uid}` | `POST` | Registers intent to work. Validates schedule constraints. |
| **Worker** | `/Jobs/MyApplications/{uid}` | `GET` | Returns historical applications and current resolution status. |

---

## 7. Quick Start & Deployment Guide

### Prerequisites
* Python 3.9+
* Node.js 18+
* Active PostgreSQL Instance

### Environment Setup (`.env`)
Generate a `.env` file in the project root containing critical runtime variables:

| Variable | Definition |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (`postgresql://usr:pwd@host/db`) |
| `SECRET_KEY` | Cryptographic JWT signing key (`openssl rand -hex 32`) |
| `ALGORITHM` | JWT Signature Algorithm (`HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifespan (`1440` recommended for 24h) |
| `TEXTBEE_API_KEY` | Authentication key for outbound SMS |
| `TEXTBEE_DEVICE_ID` | Registered Gateway Device Identifier |

### Backend Initialization
1. Navigate to the root directory.
2. Isolate the environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # (Linux/Mac)
   venv\Scripts\activate     # (Windows)
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Boot the ASGI Server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0
   ```
   *The API will be available at `http://localhost:8000`*

### Frontend Initialization
1. Navigate to the client directory:
   ```bash
   cd app-frontend
   ```
2. Install Node modules:
   ```bash
   npm install
   ```
3. Boot the Vite Development Server:
   ```bash
   npm run dev -- --host
   ```
   *The Web application will be available at `http://localhost:5173`*

---

## 8. Development Roadmap
* **Offline Service Workers**: Caching the latest job feeds to allow workers functionality in extremely low-connectivity rural zones.
* **Reputation Matrices**: Post-job bidirectional rating systems to foster trust and reliability.
* **Regional Localization**: Expanding beyond Hindi/English into regional agricultural dialects natively.
* **WebSocket Notifications**: Upgrading application status updates from polling to real-time socket events.
