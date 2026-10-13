# Attendance Live

A modern, full-stack classroom attendance management system powered by AI-driven facial liveness verification. Built with a React 19 Single-Page Application, Node.js / Express 5 REST API, PostgreSQL database, and seamless integration with the [Liveness Cloud API](https://liveness.cloud/).

[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express Version](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](package.json)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
  - [Role-Based Workflows](#role-based-workflows)
  - [Attendance Automation](#attendance-automation)
  - [Security & Anti-Proxy Protection](#security--anti-proxy-protection)
- [System Architecture](#system-architecture)
  - [Architecture Diagram](#architecture-diagram)
  - [Biometric Verification Sequence](#biometric-verification-sequence)
- [Technology Stack](#technology-stack)
- [Database Schema & Data Models](#database-schema--data-models)
  - [Entity-Relationship Diagram](#entity-relationship-diagram)
  - [Core Database Entities](#core-database-entities)
- [Liveness Cloud API Integration](#liveness-cloud-api-integration)
  - [Integration Overview](#integration-overview)
  - [Biometric Enrollment Workflow](#biometric-enrollment-workflow)
  - [Live Check-In Verification Workflow](#live-check-in-verification-workflow)
  - [Privacy & Data Minimization](#privacy--data-minimization)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Local Development](#installation-and-local-development)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Database Setup & Migrations](#4-database-setup--migrations)
  - [5. Run Development Servers](#5-run-development-servers)
- [Environment Variables](#environment-variables)
  - [Backend Configuration (`apps/api/.env`)](#backend-configuration-appsapienv)
  - [Frontend Configuration (`apps/web/.env`)](#frontend-configuration-appswebenv)
- [Available Scripts](#available-scripts)
- [Interface Overview](#interface-overview)
- [Troubleshooting](#troubleshooting)
- [Security & Privacy](#security--privacy)
- [Deployment](#deployment)
  - [Backend Deployment (Render)](#backend-deployment-render)
  - [Frontend Deployment (GitHub Pages)](#frontend-deployment-github-pages)
- [Testing and Code Quality](#testing-and-code-quality)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License and Acknowledgments](#license-and-acknowledments)

---

## Project Overview

Traditional classroom roll-calling is time-consuming, prone to proxy attendance, and burdensome for instructors managing large course rosters. **Attendance Live** replaces manual attendance sheets with a streamlined digital workflow featuring client-side biometric scanning and real-time synchronization.

### The Problem It Solves
- **Proxy Attendance ("Buddy Punching"):** Students signing in on behalf of absent peers through shared links or manual signatures.
- **Lost Class Time:** Instructors spending 5–15 minutes per lecture manually verifying attendance across large lecture halls.
- **Disorganized Records:** Scattered spreadsheets and paper logs that make auditing semester-long attendance trends tedious.

### How It Works
1. **Instructors** create course sections, distribute 6-character alphanumeric join codes, and launch time-boxed attendance sessions with a countdown timer.
2. **Students** register their facial biometric descriptor once during onboarding using their device's webcam. When a session opens, students verify their presence via real-time anti-spoofing challenges (head orientation, distance checks, blink/liveness validation).
3. **The System** validates the biometric descriptor against the student's registered face profile via the [Liveness Cloud API](https://liveness.cloud/) and marks attendance as `PRESENT`.
4. **Instructors** monitor a real-time live attendance roster (with automatic polling every 3 seconds), inspect confidence scores, and apply manual overrides with documented audit notes when necessary.

---

## Key Features

### Role-Based Workflows

The application implements three dedicated role portals guarded by server-side middleware and client-side view routing:

```
┌─────────────────────────────────────────────────────────────┐
│                    ATTENDANCE LIVE SYSTEM                   │
├───────────────┬─────────────────────────────┬───────────────┤
│    STUDENT    │          PROFESSOR          │     ADMIN     │
├───────────────┼─────────────────────────────┼───────────────┤
│ • Face Setup  │ • Create & Manage Classes   │ • User Roster │
│ • Join Course │ • Launch Timed Sessions     │ • Role Admin  │
│ • 1-Click Scan│ • Real-time Live Sync Grid  │ • Deactivate  │
│ • History Log │ • Manual Overrides & Notes  │ • Invite Fac. │
│ • Class Roster│ • Roster Drop / Restore     │ • Sys Config  │
└───────────────┴─────────────────────────────┴───────────────┘
```

#### Student Portal
- **Biometric Onboarding:** Enrolls a 128-dimensional facial embedding vector using the built-in webcam scanner. Face setup is strictly enforced prior to joining courses.
- **Class Enrollment:** Self-enroll in sections using instructor-provided 6-character join codes.
- **Live Check-In:** Automatic detection of open class sessions with a 1-click biometric verification trigger.
- **Attendance History:** Searchable personal log of attended, absent, and overridden class meetings across all enrolled courses.

#### Professor (Faculty) Portal
- **Course Section Management:** Create courses specifying course title, section code, and semester (e.g., "Fall 2026"). Classes generate unique collision-resistant join codes.
- **Timed Attendance Windows:** Launch attendance windows with preset durations (15m, 30m, 45m, 60m, 90m) or custom durations, accompanied by lecture topic labels.
- **Live Sync Roster:** Real-time polling attendance grid displaying student attendance status (`PRESENT` vs. `ABSENT`), check-in source (`LIVENESS` vs. `MANUAL_OVERRIDE`), check-in timestamp, and live turnout percentages.
- **Spreadsheet & Card Views:** Responsive UI supporting both card-based touch interfaces and spreadsheet tables with sticky columns on mobile devices.
- **Manual Overrides:** Change any student's status to `PRESENT` or `ABSENT` with mandatory or optional audit notes (e.g., excused absences, verified technical issues). Manual overrides lock the record from automated check-in overwrite.
- **Roster Controls:** View active students, drop unlisted or inactive students, or restore previously dropped students.
- **Attendance Summaries & History:** Audit past session attendance metrics and review per-student cumulative attendance percentages.
- **Course Archiving:** Archive finished courses while preserving historical attendance logs.

#### Administrator Portal
- **User Directory:** Filterable catalog of all platform users across `ALL`, `STUDENT`, `PROFESSOR`, and `ADMIN` roles.
- **Role Elevation:** Promote or demote user roles with built-in safeguards preventing self-demotion.
- **Account Governance:** Instant account deactivation and reactivation. Deactivated sessions are terminated immediately across active clients.
- **Faculty Onboarding:** Create professor accounts with automatically generated secure temporary passwords dispatched via transactional email.

---

## System Architecture

Attendance Live is structured as a decoupled monorepo managed with npm workspaces:

- **Frontend (`apps/web`):** Vite-powered React 19 SPA running in the client's browser. Communicates with the backend REST API using HTTP cookies and JSON payloads. Captures camera streams and processes facial landmarks locally via `@liveness/sdk`.
- **Backend (`apps/api`):** Node.js / Express 5 REST API. Handles route validation via Zod schemas, role-based authorization, rate limiting, and PostgreSQL transactions. Interfaces upstream with the Liveness Cloud API.
- **Database:** PostgreSQL database storing users, classes, enrollments, sessions, biometric mappings, check-in attempts, and attendance records.
- **External Services:**
  - **Liveness Cloud API (`https://liveness.cloud`):** External biometric SaaS verifying facial descriptors and anti-spoofing integrity.
  - **Resend API:** Transactional email delivery for account activation codes, temporary passwords, and password resets.
  - **Google OAuth:** Optional OpenID Connect authentication using Google Identity Services.

### Architecture Diagram

```mermaid
graph TD
    Client["Client Browser / Mobile PWA<br/>(React 19 + Tailwind CSS v4)"]
    SDK["@liveness/sdk<br/>(TensorFlow.js / FaceMesh)"]
    API["Attendance API<br/>(Express 5 on Node.js)"]
    DB[("PostgreSQL Database<br/>(Neon Serverless / Local PG)")]
    LivenessSaaS["Liveness Cloud SaaS<br/>(https://liveness.cloud)"]
    ResendSaaS["Resend Email API<br/>(Transaction Emails)"]
    GoogleAuth["Google Identity<br/>(OAuth 2.0 ID Token)"]

    Client -->|"Local Camera Feed & AI Landmarks"| SDK
    SDK -->|"128-D Vector + Anti-Spoofing Hash"| Client
    Client -->|"HTTPS / REST API (httpOnly Cookie)"| API
    API -->|"SQL Queries (pg Pool)"| DB
    API -->|"POST /enroll & POST /verify-one"| LivenessSaaS
    API -->|"SMTP Dispatch (OTP & Reset Links)"| ResendSaaS
    API -->|"Verify Google ID Token"| GoogleAuth
```

### Biometric Verification Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student (Webcam)
    participant Web as apps/web (React + @liveness/sdk)
    participant API as apps/api (Express 5)
    participant SaaS as Liveness Cloud API
    participant DB as PostgreSQL Database

    Student->>Web: Clicks "Start Check-In"
    Web->>Web: Accesses camera stream, validates orientation
    Web->>Web: Evaluates anti-spoofing challenges (oval align, head turns)
    Web->>Web: Extracts 128-D facial descriptor & integrity payload
    Web->>API: POST /api/check-ins { sessionId, descriptor, integrity, ... }
    API->>DB: Validates session status (OPEN), expiry, and class enrollment
    API->>DB: Retrieves student's liveness_external_id
    API->>SaaS: POST /verify-one { descriptor, targetId: liveness_external_id }
    SaaS-->>API: Returns { verified: true, match: { similarity: 0.94 }, confidence: "HIGH" }
    API->>DB: Logs check_in_attempts (outcome: SUCCESS, similarity, confidence)
    API->>DB: Upserts attendance_records (status: PRESENT, source: LIVENESS)
    API-->>Web: Returns { present: true }
    Web-->>Student: Displays success state & marks attendance
```

---

## Technology Stack

### Frontend (`apps/web`)
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^19.2.8` | Declarative UI library with hooks, context, and Suspense code splitting |
| **Vite** | `^8.2.0` | Frontend build tool and rapid development server |
| **Tailwind CSS** | `^4.3.3` | Utility-first CSS styling framework using the `@tailwindcss/vite` plugin |
| **@liveness/sdk** | `^1.0.7` | Client-side camera management, face landmarking, and challenge execution |
| **ESLint** | `^10.8.0` | Code quality and React hook rules enforcement |

### Backend (`apps/api`)
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>=20.0.0` | JavaScript runtime supporting ES modules and native `--watch` |
| **Express** | `^5.2.1` | HTTP web server and REST routing framework |
| **pg** | `^8.22.0` | PostgreSQL client and connection pooling |
| **node-pg-migrate** | `^9.0.0` | SQL schema migration runner |
| **Zod** | `^4.4.3` | Schema definition and strict request validation |
| **jsonwebtoken** | `^9.0.3` | Creation and verification of signed session tokens |
| **bcrypt** | `^6.0.0` | Salted password hashing (10 salt rounds) |
| **express-rate-limit** | `^8.6.2` | IP and account-based endpoint rate limiting |
| **axios** | `^1.19.0` | HTTP client for upstream Liveness Cloud API requests |
| **resend** | `^6.28.1` | Transactional email delivery SDK |
| **google-auth-library**| `^11.0.2` | Verification of Google OAuth ID tokens |
| **cookie-parser** | `^1.4.7` | Parse and manage secure HTTP-only cookies |
| **cors** | `^2.8.6` | Cross-Origin Resource Sharing configuration |
| **dotenv** | `^17.4.2` | Environment variable management |

---

## Database Schema & Data Models

The persistence layer uses PostgreSQL with UUID primary keys (`gen_random_uuid()`) and strict foreign key constraints.

### Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ CLASSES : "instructs"
    USERS ||--o{ ENROLLMENTS : "participates"
    USERS ||--o{ BIOMETRIC_ENROLLMENTS : "has"
    USERS ||--o{ ATTENDANCE_SESSIONS : "opens"
    USERS ||--o{ CHECK_IN_ATTEMPTS : "makes"
    USERS ||--o{ ATTENDANCE_RECORDS : "assigned"
    USERS ||--o{ PASSWORD_RESET_TOKENS : "requests"
    USERS ||--o{ EMAIL_VERIFICATION_TOKENS : "receives"

    CLASSES ||--o{ ENROLLMENTS : "contains"
    CLASSES ||--o{ ATTENDANCE_SESSIONS : "schedules"

    ATTENDANCE_SESSIONS ||--o{ CHECK_IN_ATTEMPTS : "logs"
    ATTENDANCE_SESSIONS ||--o{ ATTENDANCE_RECORDS : "records"

    CHECK_IN_ATTEMPTS ||--o| ATTENDANCE_RECORDS : "substantiates"

    USERS {
        uuid id PK
        enum role "STUDENT | PROFESSOR | ADMIN"
        string full_name
        string email UK
        string password_hash
        string google_id UK
        boolean must_change_password
        boolean is_active
        boolean is_email_verified
        timestamp created_at
    }

    CLASSES {
        uuid id PK
        uuid professor_id FK
        string name
        string section
        string semester
        string join_code UK
        boolean is_archived
        timestamp created_at
    }

    ENROLLMENTS {
        uuid id PK
        uuid class_id FK
        uuid student_id FK
        enum status "ACTIVE | DROPPED"
        enum enrolled_via "SELF_ENROLLED | PROFESSOR_ADDED"
        timestamp enrolled_at
    }

    ATTENDANCE_SESSIONS {
        uuid id PK
        uuid class_id FK
        uuid opened_by FK
        string label
        enum status "OPEN | CLOSED"
        timestamp opened_at
        timestamp expires_at
        timestamp closed_at
    }

    BIOMETRIC_ENROLLMENTS {
        uuid id PK
        uuid student_id FK
        uuid liveness_external_id UK
        enum status "ACTIVE | REVOKED"
        timestamp enrolled_at
        timestamp revoked_at
    }

    CHECK_IN_ATTEMPTS {
        uuid id PK
        uuid session_id FK
        uuid student_id FK
        enum outcome "SUCCESS | FAILURE | ERROR"
        numeric similarity
        string confidence_level
        boolean identity_match
        jsonb saas_raw_response
        timestamp attempted_at
    }

    ATTENDANCE_RECORDS {
        uuid id PK
        uuid session_id FK
        uuid student_id FK
        enum status "PRESENT | ABSENT"
        enum source "LIVENESS | MANUAL_OVERRIDE"
        uuid check_in_attempt_id FK
        uuid recorded_by FK
        string override_reason
        timestamp recorded_at
    }
```

### Core Database Entities

1. **`users`:** Stores system accounts with roles (`STUDENT`, `PROFESSOR`, `ADMIN`), activation state, email verification flags, and optional Google OAuth link.
2. **`classes`:** Course sections managed by professors. Includes composite unique constraint `(professor_id, name, semester, section)` and unique 6-character `join_code`.
3. **`enrollments`:** Junction table linking students to classes with status (`ACTIVE`, `DROPPED`).
4. **`attendance_sessions`:** Time-boxed attendance windows. Includes partial unique index `(class_id) WHERE status = 'OPEN'`, ensuring only one active attendance session per class at any time.
5. **`biometric_enrollments`:** Stores the external UUID (`liveness_external_id`) assigned by Liveness Cloud. Guaranteed at most one active biometric enrollment per student via partial unique index.
6. **`check_in_attempts`:** Immutable audit log storing every verification attempt with similarity score, confidence grade, and complete raw SaaS response.
7. **`attendance_records`:** The canonical attendance ledger per session. Uniquely keyed by `(session_id, student_id)`. Tracks whether attendance was marked by `LIVENESS` verification or a professor's `MANUAL_OVERRIDE`.
8. **`password_reset_tokens` & `email_verification_tokens`:** Stores one-way SHA-256 hashed temporary tokens and 6-digit OTP verification codes with time-to-live expiration checks.

---

## Liveness Cloud API Integration

The project integrates with the [Liveness Cloud API](https://liveness.cloud/) to provide passive and active anti-spoofing verification and 1-to-1 facial identity matching.

### Integration Overview

The integration is split into client-side biometric capture and server-side authentication:

```
[Camera Stream] ──> [@liveness/sdk in Browser] ──> [apps/api Backend] ──> [Liveness Cloud SaaS]
```

- **Client (`@liveness/sdk`):** Runs lightweight on-device models to ensure a real human is present before taking a snapshot. Challenges include:
  - **`WAITING`:** Framing the face inside the oval guide and checking focal distance.
  - **`TURN_LEFT` / `TURN_RIGHT`:** Interactive head rotation tracking with a real-time progress bar.
- **Backend Service (`apps/api/src/integrations/liveness/client.js`):** Signs requests using the `x-api-key` header with a 15-second network timeout.

### Biometric Enrollment Workflow
1. The student triggers the enrollment scanner in the **Face Setup** tab.
2. `@liveness/sdk` conducts liveness challenges and generates a 128-dimensional floating-point embedding vector (`descriptor`), a unique `sessionToken`, and a tamper-resistant integrity hash.
3. The client submits the payload to `POST /api/biometric-enrollments`.
4. The backend calls Liveness Cloud `POST /enroll` with `{ name: student.full_name, descriptor, ... }`.
5. Liveness Cloud stores the descriptor and returns an external identifier (`id`).
6. The backend saves `liveness_external_id` into the `biometric_enrollments` table and marks any previous enrollment as revoked.

### Live Check-In Verification Workflow
1. The student opens an active class session and starts the scanner.
2. `@liveness/sdk` completes active challenges and produces an updated check-in descriptor and integrity payload.
3. The client submits `POST /api/check-ins` with `{ sessionId, descriptor, ... }`.
4. The backend verifies that the session is currently `OPEN`, has not expired, and that the student has not already been manually overridden by the instructor.
5. The backend calls Liveness Cloud `POST /verify-one` passing the current descriptor and `targetId: enrollment.liveness_external_id`.
6. Liveness Cloud performs vector similarity comparison against the student's enrolled descriptor and returns:
   ```json
   {
     "verified": true,
     "match": { "similarity": 0.9412 },
     "confidence": "HIGH"
   }
   ```
7. If `verified === true`: An entry is inserted into `check_in_attempts` as `SUCCESS` and upserted into `attendance_records` as `PRESENT` (`source: 'LIVENESS'`).
8. If verification fails: An entry is inserted into `check_in_attempts` as `FAILURE`. The student remains `ABSENT` on the attendance roster.

### Privacy & Data Minimization
- **No Raw Images Stored:** Neither the local backend nor Liveness Cloud stores raw video footage or unencrypted photos of student faces. Only 128-dimensional numerical vectors and anti-spoofing telemetry are exchanged.
- **Client-Side Camera Control:** Video media streams are captured exclusively during active scanner dialogs and are terminated (`stream.getTracks().forEach(t => t.stop())`) immediately upon scanner completion or dismissal.

---

## Project Structure

```
attendance-app/
├── .github/
│   └── workflows/
│       └── deploy-web.yml          # GitHub Actions workflow deploying web to GitHub Pages
├── apps/
│   ├── api/                        # Backend REST API service
│   │   ├── src/
│   │   │   ├── controllers/        # Route handlers (auth, admin, classes, check-in, etc.)
│   │   │   ├── db/                 # PostgreSQL pool setup and admin seeding
│   │   │   │   └── migrations/     # node-pg-migrate SQL migrations
│   │   │   ├── integrations/
│   │   │   │   └── liveness/       # Upstream Liveness Cloud API HTTP client
│   │   │   ├── middleware/         # JWT auth, role validation, rate limiting, account checks
│   │   │   ├── repositories/       # Direct SQL database queries
│   │   │   ├── routes/             # Express router declarations
│   │   │   ├── schemas/            # Zod validation schemas
│   │   │   ├── services/           # Business logic (attendance, classes, emails, check-ins)
│   │   │   ├── utils/              # Custom HTTP error classes, email normalizers
│   │   │   └── index.js            # Express server entry point
│   │   ├── .env.example            # Environment variable template for API
│   │   └── package.json            # Backend dependencies and migration scripts
│   │
│   └── web/                        # Frontend Single-Page Application
│       ├── public/                 # Static public assets (favicon.svg, icons.svg)
│       ├── src/
│       │   ├── assets/             # Branding assets
│       │   ├── components/
│       │   │   ├── account/        # Account settings and profile management
│       │   │   ├── admin/          # Admin user directory and professor invitations
│       │   │   ├── auth/           # Login, registration, password reset forms
│       │   │   ├── layout/         # App header, sliding sidebar, responsive layout
│       │   │   ├── liveness/       # Camera overlay and challenge progress bars
│       │   │   ├── professor/      # Class controller, live attendance grid, rosters
│       │   │   ├── student/        # Enrolled classes, check-in cards, face setup
│       │   │   └── ui/             # Reusable modals, badges, avatars, skeletons, icons
│       │   ├── context/            # React Context providers (Auth, Toast, Confirm)
│       │   ├── utils/              # Navigation helpers, formatting, session state
│       │   ├── api.js              # Centralized frontend API client
│       │   ├── App.jsx             # Root routing and role portal loader
│       │   ├── LivenessCamera.jsx  # Face scanner component integrating @liveness/sdk
│       │   └── main.jsx            # React 19 entry point
│       ├── .env.example            # Environment variable template for Web
│       ├── index.html              # HTML shell
│       ├── package.json            # Frontend dependencies
│       └── vite.config.js          # Vite configuration with proxy and base path
│
├── package.json                    # Monorepo root workspace configuration
├── package-lock.json               # Locked dependency tree
├── render.yaml                     # Render Blueprint specification for API service
└── README.md                       # Comprehensive project documentation
```

---

## Prerequisites

Before setting up the project locally, verify that your development environment includes:

- **Node.js:** `v20.x` or higher (tested with Node 20 LTS; Node 18+ supported).
- **npm:** `v10.x` or higher (monorepo workspaces support).
- **PostgreSQL Database:** PostgreSQL `14+` instance running locally or hosted on [Neon](https://neon.tech/) with the `pgcrypto` extension enabled.
- **Webcam:** A functioning camera connected to your computer or mobile device.
- **Liveness Cloud API Key:** Valid account credentials from [Liveness Cloud](https://liveness.cloud/).
- *(Optional)* **Resend API Key:** Account from [Resend](https://resend.com/) for transactional email dispatch.
- *(Optional)* **Google OAuth Client ID:** Google Cloud credentials for Google Sign-In.

---

## Installation and Local Development

Follow these steps to set up and run Attendance Live locally:

### 1. Clone Repository

```bash
git clone https://github.com/LourdenB15/attendance-app.git
cd attendance-app
```

### 2. Install Dependencies

Install all root, API, and Web workspace dependencies simultaneously:

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env` configuration files for both the backend and frontend:

#### Configure Backend (`apps/api/.env`)
```bash
cp apps/api/.env.example apps/api/.env
```
Open `apps/api/.env` and supply your database connection string and API keys:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/attendance_db
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
ALLOWED_ORIGINS=http://localhost:5173
APP_URL=http://localhost:5173

# Default Admin Account (Automatically bootstrapped on startup)
ADMIN_NAME="System Administrator"
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPassword123!

# Liveness Cloud Credentials
LIVENESS_API_KEY=your_liveness_cloud_api_key
LIVENESS_API_URL=https://api.liveness.cloud

# Optional: Transactional Email & Google Sign-In
RESEND_API_KEY=
RESEND_FROM_EMAIL=onboarding@resend.dev
GOOGLE_CLIENT_ID=
```

#### Configure Frontend (`apps/web/.env`)
```bash
cp apps/web/.env.example apps/web/.env
```
Configure `apps/web/.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=
```

### 4. Database Setup & Migrations

Ensure your PostgreSQL service is running and the database specified in `DATABASE_URL` exists. Then apply all SQL schema migrations:

```bash
npm run db:migrate
```
*(Alternatively, execute `npm run migrate:up -w apps/api`)*

To seed or verify the administrator account configured in your `.env`:
```bash
npm run seed:admin -w apps/api
```

### 5. Run Development Servers

Run the frontend and backend in separate terminal windows:

#### Terminal 1 — Start the Backend API (Port 3001)
```bash
npm run dev:api
```
*(Runs `node --watch src/index.js` inside `apps/api`)*

#### Terminal 2 — Start the Frontend SPA (Port 5173)
```bash
npm run dev:web
```
*(Runs `vite` inside `apps/web`)*

#### Access the Application
Open your web browser and navigate to:
```
http://localhost:5173
```
Log in using the administrator credentials configured in `apps/api/.env` (`admin@example.com` / `AdminPassword123!`).

---

## Environment Variables

### Backend Configuration (`apps/api/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | **Yes** | `3001` | Local port for Express API server |
| `NODE_ENV` | No | `development` | Environment mode (`development` \| `production`) |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection URI |
| `JWT_SECRET` | **Yes** | — | Secret key used to sign and verify HTTP-only session JWTs |
| `ALLOWED_ORIGINS` | No | `http://localhost:5173` | Comma-separated list of allowed CORS origins |
| `APP_URL` | No | `http://localhost:5173` | Web application URL embedded in password reset emails |
| `ADMIN_NAME` | **Yes** | — | Display name for the initial admin account |
| `ADMIN_EMAIL` | **Yes** | — | Login email for the initial admin account |
| `ADMIN_PASSWORD` | **Yes** | — | Initial password for the admin account |
| `LIVENESS_API_KEY` | **Yes** | — | API key provided by [Liveness Cloud](https://liveness.cloud/) |
| `LIVENESS_API_URL` | **Yes** | `http://localhost:3000/api/liveness` | Base endpoint for Liveness Cloud SaaS |
| `RESEND_API_KEY` | No | — | API key from Resend for email delivery |
| `RESEND_FROM_EMAIL` | No | `onboarding@resend.dev` | Sender email address for outgoing emails |
| `GOOGLE_CLIENT_ID` | No | — | Google Cloud OAuth Client ID for Google Sign-In |
| `API_RATE_LIMIT_MAX` | No | `5000` (dev) / `1500` (prod)| Max general API requests per 15-minute window |
| `AUTH_RATE_LIMIT_MAX`| No | `300` | Max auth endpoint requests per 15 minutes per IP |
| `LOGIN_EMAIL_RATE_LIMIT_MAX` | No | `10` | Max failed logins per email before 15-minute cooldown |
| `EMAIL_SEND_RATE_LIMIT_MAX` | No | `5` | Max email requests per hour for password resets |

### Frontend Configuration (`apps/web/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | No | `http://localhost:3001` | Origin of the backend API server |
| `VITE_BASE_PATH` | No | `/` | Base URL path for assets (configured for GitHub Pages deployment) |
| `VITE_GOOGLE_CLIENT_ID` | No | — | Google Client ID enabling client-side Google Login button |

---

## Available Scripts

Scripts declared in the monorepo root and workspace manifests:

### Root Scripts (`package.json`)
- `npm run dev:web`: Starts the Vite development server for the web frontend (`apps/web`).
- `npm run dev:api`: Starts the backend API in watch mode (`apps/api`).
- `npm run db:migrate`: Executes pending SQL migrations on the database (`apps/api`).

### Backend Scripts (`apps/api/package.json`)
- `npm start -w apps/api`: Runs the backend in production mode (`node src/index.js`).
- `npm run dev -w apps/api`: Runs the backend with native file watch reload (`node --watch src/index.js`).
- `npm run seed:admin -w apps/api`: Ensures the admin account specified in `.env` exists.
- `npm run migrate:up -w apps/api`: Applies all unapplied SQL migrations.
- `npm run migrate:down -w apps/api`: Rolls back the most recently applied migration.
- `npm run migrate:create -w apps/api -- <name>`: Generates a new migration SQL file.

### Frontend Scripts (`apps/web/package.json`)
- `npm run dev -w apps/web`: Starts the local Vite development server at `http://localhost:5173`.
- `npm run build -w apps/web`: Compiles and bundles production static assets to `apps/web/dist`.
- `npm run lint -w apps/web`: Runs ESLint across all frontend source files.
- `npm run preview -w apps/web`: Serves the production build locally for testing.

---

## Interface Overview

Attendance Live features a responsive interface modeled after Google Classroom and modern educational portals:

- **Authentication & Welcome Screen:** Dual-pane layout featuring an institutional brand panel, email/password authentication, Google One-Tap sign-in, and 6-digit email OTP verification dialogs.
- **Student Dashboard:** Course section cards displaying active instructor sessions, one-click biometric attendance triggers, and detailed attendance logs.
- **Biometric Scanner Modal:** Fullscreen/overlay camera viewfinder with responsive 3:4 (mobile portrait) and 16:9 (desktop) aspect ratios, dynamic oval face positioning guides, head rotation progress meters, and anti-spoofing feedback.
- **Teaching Hub (Professor Portal):** Course overview, section detail views with live countdown timers, and a real-time attendance grid with search, status filters, and manual override dialogs.
- **Admin Control Center:** User directory table with role toggles, account deactivation triggers, and faculty invitation forms.

> **Recommended Screenshots for Documentation:**
> Future contributors can enhance this repository by adding annotated interface captures in a `docs/images/` directory:
> 1. `docs/images/auth-login.png` — Authentication screen and OTP verification.
> 2. `docs/images/biometric-scanner.png` — Viewfinder showing the oval guide and anti-spoofing challenges.
> 3. `docs/images/professor-live-roster.png` — Live attendance grid with active session countdown.
> 4. `docs/images/student-portal.png` — Student dashboard with enrolled courses and check-in prompt.
> 5. `docs/images/admin-users.png` — Administrator user directory and role management view.

---

## Troubleshooting

### 1. Camera Access Fails or Scanner Displays Black Screen
- **Browser Permissions:** Ensure camera permissions are granted in your browser settings.
- **Secure Context Required:** WebRTC and `navigator.mediaDevices.getUserMedia` require a secure context (`https://` or `http://localhost`). Accessing the app over an insecure local network IP (e.g., `http://192.168.1.x`) will block camera access in Chromium browsers.
- **Multiple Apps Locking Camera:** Verify that another application (Zoom, Teams, etc.) is not locking your camera hardware.

### 2. "Liveness service request failed" or 502/503 Errors
- Check that `LIVENESS_API_KEY` and `LIVENESS_API_URL` in `apps/api/.env` are correctly set.
- Ensure the Liveness Cloud service endpoint is reachable from your server network.
- Inspect the `check_in_attempts` table in PostgreSQL to examine the `saas_raw_response` error details.

### 3. Database Connection Issues
- Verify that PostgreSQL is running and accepting connections on the host/port specified in `DATABASE_URL`.
- If using Neon PostgreSQL, ensure the connection string includes SSL parameters: `?sslmode=require`.
- Run `npm run db:migrate` to verify network connectivity and that schema tables exist.

### 4. CORS Errors on Web Check-In
- Verify that `ALLOWED_ORIGINS` in `apps/api/.env` includes your exact frontend URL (e.g., `http://localhost:5173` without a trailing slash).
- Confirm that `VITE_API_URL` in `apps/web/.env` points to the correct backend host and port.

### 5. Email Verification or Password Reset Codes Not Received
- Check the backend console output. If `RESEND_API_KEY` is omitted, the API logs: `⚠️ RESEND_API_KEY not configured. verification email not sent.`
- For local testing, verify the generated token or OTP directly from the `email_verification_tokens` table in PostgreSQL.

---

## Security & Privacy

The system incorporates several security practices designed for academic and institutional settings:

- **Credential Isolation:** Passwords are never stored in plaintext and are salted using bcrypt (10 rounds).
- **Session Protection:** Session tokens are stored in signed, HTTP-only, SameSite cookies to protect against Cross-Site Scripting (XSS) token exfiltration.
- **Multi-Tier Rate Limiting:** Prevents brute-force credential stuffing against user accounts and stops email flooding via transactional routes.
- **Tamper-Resistant Attendance Records:** When an instructor applies a `MANUAL_OVERRIDE`, the record is locked against automated check-in overwrites.
- **Biometric Minimization:** Facial videos and raw images never leave the client's browser. Only 128-dimensional mathematical descriptor vectors are transmitted for verification.
- **Separation of Privileges:** Route-level middleware ensures only professors can access their own class rosters and only administrators can alter user roles or invite faculty.

---

## Deployment

### Backend Deployment (Render)

The repository includes a ready-to-use [`render.yaml`](render.yaml) blueprint specification:

1. Connect your GitHub repository to [Render](https://render.com/).
2. Select **New Blueprint Instance** and link this repository.
3. Render automatically detects the `attendance-api` service configured in `render.yaml`:
   - **Runtime:** Node.js
   - **Root Directory:** `apps/api`
   - **Build Command:** `npm install && npm run migrate:up`
   - **Start Command:** `npm start`
4. Set the following environment variables in the Render Dashboard:
   - `DATABASE_URL`: Connection string for your production PostgreSQL instance (e.g., Neon).
   - `JWT_SECRET`: Secure random string (automatically generated if omitted).
   - `LIVENESS_API_KEY` & `LIVENESS_API_URL`: Your production Liveness Cloud credentials.
   - `ALLOWED_ORIGINS`: Your production frontend URL (e.g., `https://lourdenb15.github.io`).
   - `APP_URL`: Production frontend URL.
   - `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: Production administrator account credentials.
   - *(Optional)* `RESEND_API_KEY` & `RESEND_FROM_EMAIL`: Production email credentials.

### Frontend Deployment (GitHub Pages)

The repository includes a GitHub Actions workflow [`.github/workflows/deploy-web.yml`](.github/workflows/deploy-web.yml) configured to build and deploy the web application:

1. In your GitHub repository, navigate to **Settings > Pages**.
2. Set the build and deployment source to **GitHub Actions**.
3. In **Settings > Secrets and variables > Actions**, configure repository variables:
   - `VITE_API_URL`: The deployed URL of your Render API backend (e.g., `https://attendance-api.onrender.com`).
   - `VITE_GOOGLE_CLIENT_ID`: (Optional) Your Google OAuth Client ID.
4. Pushing changes to the `main` branch will automatically build `apps/web` and deploy the static bundle to GitHub Pages.

---

## Testing and Code Quality

- **Linting:** Code formatting and React hook rules are enforced using ESLint:
  ```bash
  npm run lint -w apps/web
  ```
- **Automated Tests:** The repository currently does not include an automated unit or end-to-end testing suite.
- **Recommended Test Implementation Areas:**
  - **Unit Testing:** Vitest for schema validation (`apps/api/src/schemas/`) and utility functions (`apps/web/src/utils/`).
  - **Integration Testing:** Supertest for Express API endpoints (`auth.routes.js`, `classes.routes.js`, `check-in.routes.js`).
  - **End-to-End Testing:** Playwright for automated browser testing of role portals and webcam mock check-in workflows.

---

## Roadmap

Planned enhancements for future releases:

- [ ] **Automated Test Coverage:** Introduce Vitest and Supertest suites for CI pipeline test automation.
- [ ] **CSV / Excel Export:** Allow professors to download semester-long attendance spreadsheets with a single click.
- [ ] **Geofencing Verification:** Optional IP or GPS proximity validation alongside biometric verification to confirm physical classroom presence.
- [ ] **Offline Fallback Sync:** PWA service worker caching allowing attendance recording during sporadic network interruptions.
- [ ] **Canvas / Moodle LMS Integration:** LTI 1.3 standard integration to synchronize course rosters and grades directly with university Learning Management Systems.

---

## Contributing

Contributions from students, educators, and open-source developers are welcome!

1. **Fork the Repository:** Click "Fork" on GitHub to create your personal copy.
2. **Create a Feature Branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make and Verify Changes:**
   - Follow existing code style and naming conventions.
   - Ensure the frontend linter passes: `npm run lint -w apps/web`.
   - Test your changes locally against both frontend and backend services.
4. **Commit Changes:** Use descriptive, conventional commit messages:
   ```bash
   git commit -m "feat(professor): add attendance roster export filter"
   ```
5. **Push and Open a Pull Request:** Push your branch to GitHub and submit a Pull Request describing your changes and testing steps.

---

## License and Acknowledgments

### License
This project is configured under the **ISC License** as specified in [`package.json`](package.json). See the repository manifests for details.

### Acknowledgments
- **[Liveness Cloud](https://liveness.cloud/):** AI-powered biometric facial liveness and identity verification API.
- **[Neon](https://neon.tech/):** Serverless PostgreSQL database platform.
- **[Render](https://render.com/):** Cloud hosting platform for web applications and APIs.
- **[Resend](https://resend.com/):** Transactional email delivery service.
- **[Google Identity Services](https://developers.google.com/identity):** Secure Google One-Tap and OAuth authentication.

---

## Author and Project Links

- **Repository:** [https://github.com/LourdenB15/attendance-app](https://github.com/LourdenB15/attendance-app)
- **Author / Maintainer:** [@LourdenB15](https://github.com/LourdenB15)
- **Official Liveness Service Documentation:** [https://liveness.cloud/](https://liveness.cloud/)
