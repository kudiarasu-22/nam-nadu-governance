<div align="center">
  
# 🏛️ Nam Nadu — நம் நாடு
**Smart Governance Platform built for the People of Tamil Nadu**

[![React](https://img.shields.io/badge/React-18.0-blue.svg?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.0-purple.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*Empowering governance through transparency, accountability, and citizen engagement.*

</div>

---

## 📖 1. Problem Statement

In modern civic administration, bridging the gap between citizens and the government is a persistent challenge. Current governance models often suffer from:
- **Complaint Delays:** Grievances get lost in bureaucratic silos with no clear SLA tracking.
- **Lack of Transparency:** Citizens lack visibility into the status of their complaints, local infrastructure projects, and fund allocations.
- **Poor Ward-Level Monitoring:** Field officers and local leaders struggle to prioritize issues efficiently due to fragmented data.
- **No Centralized Governance Visibility:** State-level administrators lack a unified dashboard to measure the real-time performance of districts, wards, and elected officials.

**Nam Nadu** solves these problems by creating a seamless, transparent, and vertically integrated ecosystem where every grievance, project, and policy is tracked, analyzed, and actioned upon.

---

## 🎯 2. Solution Overview

**Nam Nadu** is an end-to-end Smart Governance Platform that connects four pivotal pillars of state administration:

**Citizens ↔ Officers ↔ MLAs ↔ CM Admin**

1. **Citizens** raise geographically-tagged complaints, vote on local issues, and track infrastructure developments in real-time.
2. **Officers** receive intelligently routed grievances, update statuses, and resolve issues within strict Service Level Agreements (SLAs).
3. **MLAs (Members of Legislative Assembly)** monitor the real-time pulse of their specific constituency, tracking officer performance, resolving escalations, and issuing emergency broadcasts.
4. **CM Admin (Chief Minister's Office)** monitors statewide operations, evaluating MLA performance, identifying systemic bottlenecks, and driving macro-level policy execution.

---

## ✨ 3. Features

### 🧑‍🤝‍🧑 Citizen Portal
- **Register/Login:** Secure, OTP-ready authentication.
- **Raise Complaint:** Submit grievances with photo evidence and geolocation tagging.
- **Complaint Tracking:** Live status tracking via a transparent timeline.
- **Location Detection:** Automatic ward/district mapping based on GPS.
- **Notifications:** Real-time updates via in-app alerts on status changes.
- **Project Tracking:** Monitor local infrastructure progress and budget usage.
- **Voting:** Participate in community polls for local development initiatives.
- **Fund Tracking:** Visibility into ward-level fund allocation.

### 👮 Officer Portal
- **Complaint Management:** Unified inbox for assigned grievances.
- **Status Updates:** Real-time workflow progression (Assigned → In Progress → Completed).
- **Priority Handling:** Automated SLA breach warnings and severity categorization.
- **Officer Analytics:** Performance dashboards measuring resolution times.
- **Escalation Tracking:** Automatic escalation mapping for unresolved high-priority tickets.

### 🏛️ MLA Leadership Dashboard
> **Note:** Strict ward-based restriction ensures MLAs can *only* access and govern data pertaining to their elected constituency.

- **Ward Monitoring:** Holistic view of the constituency's health and development index.
- **Complaint Monitoring:** Oversight of all active/resolved complaints within the ward.
- **Officer Monitoring:** Track individual officer efficiency and SLA adherence.
- **Project Tracking:** Monitor active infrastructure developments and contractor updates.
- **Emergency Alerts:** Broadcast urgent, high-priority alerts to all active officers in the ward.
- **Ward Analytics:** Data-driven insights into recurring local issues.
- **Citizen Satisfaction Metrics:** Quantifiable public trust scores based on resolution quality.

### 👑 CM Admin Dashboard
- **Statewide Monitoring:** Macro-level dashboard aggregating data across all districts.
- **District Filtering:** Drill-down capabilities to view specific district health.
- **MLA Performance Tracking:** Automated scoring (out of 10) for MLAs based on ward efficiency.
- **Complaint Analytics:** State-wide heatmap of grievance volumes and categories.
- **Project Analytics:** Massive infrastructure tracking and capital expenditure oversight.
- **Emergency Monitoring:** View state-wide crisis alerts and rapid response metrics.

---

## 🏗️ 4. System Architecture

Nam Nadu utilizes a modern decoupled architecture, ensuring scalability, security, and high availability.

### Technology Stack
- **Frontend:** React.js, Vite, Tailwind CSS, Framer Motion, Context API, Recharts
- **Backend:** Python, FastAPI, SQLAlchemy (ORM), Pydantic
- **Database:** PostgreSQL (Hosted on Neon serverless)
- **Authentication:** JWT (JSON Web Tokens) with strict Role-Based Access Control (RBAC)
- **Hosting:** Frontend deployed on **Vercel**; Backend deployed on **Render**

### Architecture Flow Diagram

```mermaid
graph TD
    A[Citizen / User] -->|HTTPS| B(React Frontend - Vite)
    C[Officer] -->|HTTPS| B
    D[MLA / CM Admin] -->|HTTPS| B
    
    B -->|REST API calls| E{FastAPI Backend}
    
    E -->|JWT Auth Validation| F[Auth Service]
    E -->|Business Logic| G[Core Services]
    E -->|Data Access| H[SQLAlchemy ORM]
    
    H -->|TCP/IP| I[(PostgreSQL - Neon)]
```

---

## 🔐 5. Authentication Architecture

Security is paramount. Nam Nadu implements strict **Role-Based Access Control (RBAC)** to ensure data isolation:

- **Roles:** `citizen`, `officer`, `mla`, `cm_admin`
- **Separation of Concerns:** 
  - Citizens and Officers share a primary login gateway but are routed dynamically post-login.
  - **MLA** and **CM Admin** utilize completely isolated authentication portals (`/mla/login` and `/cm/login`) to prevent privilege escalation and enforce stricter compliance.
- **Token Management:** JWT access and refresh tokens. Isolated roles possess tailored token structures to prevent unauthorized cross-dashboard data fetching.

---

## 🗄️ 6. Database Architecture

The relational PostgreSQL database is designed for referential integrity and rapid analytical querying.

### Key Entities:
- **Users:** Core identity table for citizens and officers.
- **Complaints:** Grievance records linked to users, wards, and officers.
- **Projects:** Government infrastructure tracking linked to locations.
- **Districts & Wards:** Master spatial data for hierarchical routing.
- **MLA Profiles & Performance:** Highly restricted records tying leaders to their constituencies and performance metrics.
- **Emergency Alerts:** Rapid broadcast records connecting MLAs to on-ground field officers.

---

## 📂 7. Project Folder Structure

```text
Nam_Nadu/
├── frontend/                  # React Application
│   ├── src/
│   │   ├── assets/            # Static assets (logos, images)
│   │   ├── components/        # Reusable UI components (Buttons, Inputs, Cards)
│   │   ├── config/            # Role mappings and environment config
│   │   ├── context/           # React Context (Auth, Notifications, Theme)
│   │   ├── hooks/             # Custom React Hooks
│   │   ├── layouts/           # Page Wrappers (Sidebar, TopNav, MainLayout)
│   │   ├── pages/             # View components (Dashboards, Auth pages)
│   │   ├── routes/            # React Router definitions & Protected Routes
│   │   └── services/          # Axios API service layers
│   ├── package.json
│   └── vite.config.js
│
└── backend/                   # FastAPI Application
    ├── app/
    │   ├── api/               # API versioning (v1)
    │   ├── auth/              # JWT, Dependencies, Security
    │   ├── core/              # Config, Exceptions, Enums
    │   ├── database/          # Connection pooling, Sessions
    │   ├── models/            # SQLAlchemy ORM Models
    │   ├── routers/           # Route handlers (complaints, leadership, etc.)
    │   ├── schemas/           # Pydantic validation schemas
    │   └── services/          # Business logic separation
    ├── scripts/               # DB seeding and migrations
    ├── requirements.txt
    └── main.py                # ASGI entrypoint
```

---

## 🔌 8. API Architecture

The backend exposes a highly optimized RESTful API.

### Core Routes:
- `/api/v1/auth` - Standard login, registration, and token refresh.
- `/api/v1/complaints` - Grievance CRUD, status updates, and officer assignments.
- `/api/v1/master` - Location data (districts, wards, departments).
- `/api/v1/leadership` - Isolated routes for MLA dashboard metrics, isolated login, and emergency broadcasts.
- `/api/v1/cm_admin` - Protected routes for Chief Minister state-wide analytics and cross-MLA monitoring.

---

## 🖼️ 9. UI Screenshots

*(Placeholders for future project imagery)*

| Landing Page | Citizen Dashboard |
| :---: | :---: |
| ![Landing](/frontend/public/tn_logo.svg) | ![Citizen Dashboard](/frontend/public/tn_logo.svg) |

| MLA Leadership Portal | CM Statewide Monitor |
| :---: | :---: |
| ![MLA Portal](/frontend/public/tn_logo.svg) | ![CM Dashboard](/frontend/public/tn_logo.svg) |

---

## 🚀 10. Installation Guide

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (Local or Hosted)

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows:
.\.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python -m uvicorn app.main:app --reload
```
*Backend runs on `http://localhost:8000`*

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## ⚙️ 11. Environment Variables

Create `.env` files in both frontend and backend directories.

### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://user:password@host/dbname"
SECRET_KEY="your-super-secret-jwt-key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS="http://localhost:5173,https://yourdomain.com"
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL="http://127.0.0.1:8000/api/v1"
```

---

## 🌍 12. Deployment

- **Frontend:** Built with Vite and seamlessly deployable to [Vercel](https://vercel.com/) with a single click. Configure `VITE_API_BASE_URL` in Vercel settings.
- **Backend:** Docker-ready and easily deployable to [Render](https://render.com/) or AWS EC2 via ASGI web servers (Gunicorn/Uvicorn).
- **Database:** Fully compatible with Serverless Postgres providers like [Neon](https://neon.tech/) or Supabase.

---

## 🔮 13. Future Enhancements

The Nam Nadu platform is built with scalability in mind. The roadmap includes:
- 🤖 **AI Complaint Prediction:** Forecasting infrastructure failures before they happen.
- ⚡ **Smart Prioritization:** NLP-driven automated severity tagging for grievances.
- 🗺️ **GIS Mapping Integration:** Advanced geographic spatial mapping for the CM Admin.
- 📱 **Native Mobile App:** React Native application for field officers.
- 🎙️ **Tamil Voice Assistant:** Accessibility-focused voice complaint registration.
- 📊 **Predictive Analytics:** Forecasting fund requirement trends across districts.

---

## 🤝 14. Contributors

Built by a dedicated team of engineers committed to improving civic tech and democratic engagement.

- **[Your Name]** - *Lead Architect & Full Stack Developer*
- *(Add your team members here)*

---

## 📄 15. License

This project is licensed under the **MIT License**. See the `LICENSE` file for more details. 

---

<div align="center">

*Nam Nadu represents the future of democratic administration — where technology meets the people, ensuring no voice goes unheard and no issue goes unresolved.*

**[⬆ Back to Top](#-nam-nadu--நம்-நாடு)**
</div>
