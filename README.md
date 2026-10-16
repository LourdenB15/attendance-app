# Attendance Live

**Biometric Classroom Attendance Management System Powered by Active Facial Liveness Detection**

[![Deploy Web to GitHub Pages](https://github.com/LourdenB15/attendance-app/actions/workflows/deploy-web.yml/badge.svg)](https://github.com/LourdenB15/attendance-app/actions/workflows/deploy-web.yml)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)

- **Live Application:** [https://attendance-app.online](https://attendance-app.online)
- **Repository:** [https://github.com/LourdenB15/attendance-app](https://github.com/LourdenB15/attendance-app)
- **Liveness Platform:** [https://liveness.cloud/](https://liveness.cloud/)

![Attendance Live Banner](apps/web/public/og-image.png)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Interface Preview and Visual Assets](#3-interface-preview-and-visual-assets)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
6. [Project Structure](#6-project-structure)
7. [Prerequisites](#7-prerequisites)
8. [Installation and Local Development](#8-installation-and-local-development)
9. [Environment Variables and API Configuration](#9-environment-variables-and-api-configuration)
10. [Database and Data Flow](#10-database-and-data-flow)
11. [Liveness Cloud API Integration](#11-liveness-cloud-api-integration)
12. [API Reference Summary](#12-api-reference-summary)
13. [Available Scripts](#13-available-scripts)
14. [Troubleshooting](#14-troubleshooting)
15. [Security and Privacy](#15-security-and-privacy)
16. [Deployment](#16-deployment)
17. [Testing and Code Quality](#17-testing-and-code-quality)
18. [Roadmap](#18-roadmap)
19. [Contributing](#19-contributing)
20. [License and Acknowledgments](#20-license-and-acknowledgments)
21. [Authors and Collaborators](#21-authors-and-collaborators)

---

## 1. Project Overview

**Attendance Live** is a full-stack web application designed for academic institutions to automate and secure classroom attendance tracking. Traditional attendance methods—such as paper sign-in sheets, verbal roll calls, or static QR codes—consume lecture time and are vulnerable to proxy attendance ("buddy punching"). Basic facial recognition systems also remain susceptible to presentation attacks using static photographs or pre-recorded videos on mobile screens.

Attendance Live addresses these challenges by combining a role-based academic portal with browser-based active liveness detection via `@liveness/sdk` and the [Liveness Cloud API](https://liveness.cloud/).

### Intended Users
- **Students:** Enroll their facial biometric profile once, join classes via 6-character join codes, complete active liveness challenges to check into open sessions, and track their attendance records across classes.
- **Professors:** Create and manage course sections, open time-boxed attendance sessions during lectures, monitor student check-ins in real time, apply manual attendance overrides (`PRESENT` or `ABSENT`), and review cumulative section attendance matrices.
- **Administrators:** Provision professor accounts with temporary credentials, manage user roles (`STUDENT`, `PROFESSOR`, `ADMIN`), and activate or deactivate user accounts across the institution.

### How the Components Work Together
1. **Browser Client (`apps/web`):** Runs MediaPipe Face Mesh (WASM) and TensorFlow.js via `@liveness/sdk` to guide the student through randomized active challenges (`BLINK`, `TURN_LEFT`, `TURN_RIGHT`) and extract a 128-dimensional facial feature descriptor locally on the device.
2. **Backend API (`apps/api`):** Authenticates requests via `httpOnly` JWT cookies, validates session state and class enrollment in PostgreSQL, enforces schema constraints via Zod, and communicates with the external Liveness Cloud API using a server-side API key.
3. **Liveness Cloud API (`https://liveness.cloud/`):** Stores enrolled biometric descriptors against an external reference ID (`/enroll`) and performs 1-to-1 identity verification (`/verify-one`) during session check-ins.
4. **PostgreSQL Database:** Persists users, classes, enrollments, attendance sessions, biometric enrollment references, check-in attempt audit logs, and final attendance records.

---

## 2. Key Features

All features listed below are verified in the repository source code:

### Authentication and Account Management
- **Student Self-Registration & Email Verification:** Students register with email and password ([`RegisterForm.jsx`](apps/web/src/components/auth/RegisterForm.jsx)) and verify their account using a 6-digit verification code sent via Resend ([`VerifyEmailView.jsx`](apps/web/src/components/auth/VerifyEmailView.jsx), [`auth.service.js`](apps/api/src/services/auth.service.js)).
- **Google OAuth 2.0 Sign-In:** One-click authentication using Google Identity Services (`google-auth-library`), automatically linking or creating verified student accounts ([`GoogleLoginButton.jsx`](apps/web/src/components/auth/GoogleLoginButton.jsx)).
- **Mandatory Password Rotation:** Professor accounts created by administrators and bootstrapped admin accounts are flagged with `must_change_password = true`, requiring a password update upon first sign-in ([`MustChangePasswordBanner.jsx`](apps/web/src/components/auth/MustChangePasswordBanner.jsx), [`check-account-status.js`](apps/api/src/middleware/check-account-status.js)).
- **Password Recovery & Profile Settings:** Token-based password reset emails (valid for 30 minutes) and profile name updates ([`ForgotPasswordForm.jsx`](apps/web/src/components/auth/ForgotPasswordForm.jsx), [`ResetPasswordForm.jsx`](apps/web/src/components/auth/ResetPasswordForm.jsx), [`AccountSettingsView.jsx`](apps/web/src/components/account/AccountSettingsView.jsx)).

### Active Biometric Liveness & Check-In
- **Preloaded MediaPipe & TensorFlow.js Models:** [`LivenessCamera.jsx`](apps/web/src/LivenessCamera.jsx) pre-fetches and initializes the Face Mesh WASM graph and 128-D face recognition weights prior to starting the camera stream.
- **Randomized Active Challenges:** Both biometric enrollment and attendance check-in require completing `"BLINK"`, `"TURN_LEFT"`, and `"TURN_RIGHT"` challenges in randomized order alongside face centering (`"WAITING"`), enforced on both the frontend ([`LivenessCamera.jsx`](apps/web/src/LivenessCamera.jsx)) and backend Zod schemas ([`check-in.schema.js`](apps/api/src/schemas/check-in.schema.js), [`biometric-enrollment.schema.js`](apps/api/src/schemas/biometric-enrollment.schema.js)).
- **Environmental & Framing Checks:** Real-time detection of face distance (`CLOSER` / `FURTHER`), lighting thresholds (`POOR_LIGHTING`), and eye/face occlusion (`OCCLUSION_DETECTED`), with adaptive portrait/landscape camera constraints for mobile and desktop viewports.

### Professor Workflow ([`ProfessorPortal.jsx`](apps/web/src/components/professor/ProfessorPortal.jsx))
- **Class & Section Management:** Create classes with course name, section code, and semester; edit class metadata; copy unique join codes; and archive/unarchive courses ([`ClassesTable.jsx`](apps/web/src/components/professor/ClassesTable.jsx), [`CreateClassCard.jsx`](apps/web/src/components/professor/CreateClassCard.jsx)).
- **Live Session Controller:** Open an attendance window with a custom topic/label and configurable duration (1–480 minutes, defaulting to 60 minutes) with a live countdown timer and manual close control ([`SessionController.jsx`](apps/web/src/components/professor/SessionController.jsx)).
- **Live Attendance Grid & Manual Overrides:** Monitor student check-ins as they occur (polling every 4 seconds while a session is open) and manually mark any enrolled student `PRESENT` or `ABSENT` with an optional override reason ([`LiveAttendanceGrid.jsx`](apps/web/src/components/professor/LiveAttendanceGrid.jsx)).
- **Override Protection:** Once a professor records a `MANUAL_OVERRIDE` for a student in a session, subsequent biometric check-in attempts by that student for that session are blocked with `409 Conflict` (`ATTENDANCE_OVERRIDDEN`) so the instructor's decision remains final ([`check-in.service.js`](apps/api/src/services/check-in.service.js)).
- **Roster & Section Attendance History:** Drop or restore students on the class roster ([`EnrolledStudentsTable.jsx`](apps/web/src/components/professor/EnrolledStudentsTable.jsx)) and inspect per-session statistics as well as a cross-session student attendance matrix ([`SectionAttendanceHistory.jsx`](apps/web/src/components/professor/SectionAttendanceHistory.jsx)).

### Student Workflow ([`StudentPortal.jsx`](apps/web/src/components/student/StudentPortal.jsx))
- **Biometric Face Setup:** Guided onboarding to register or update a student's facial biometric profile ([`BiometricEnrollmentCard.jsx`](apps/web/src/components/student/BiometricEnrollmentCard.jsx)).
- **Course Enrollment & Personal Archiving:** Join classes by code ([`JoinClassCard.jsx`](apps/web/src/components/student/JoinClassCard.jsx)), toggle between card grid and spreadsheet table views, and locally archive/restore classes ([`EnrolledClassesTable.jsx`](apps/web/src/components/student/EnrolledClassesTable.jsx)).
- **Class Detail & Classmate Directory:** View open session banners, past check-in records for a specific class, and the class roster of teachers and classmates ([`StudentClassDetail.jsx`](apps/web/src/components/student/StudentClassDetail.jsx)).
- **Global Attendance History:** Searchable and sortable history of all recorded attendance across enrolled courses ([`AttendanceHistoryTable.jsx`](apps/web/src/components/student/AttendanceHistoryTable.jsx)).

### Administrator Workflow ([`AdminPortal.jsx`](apps/web/src/components/admin/AdminPortal.jsx))
- **Faculty Provisioning:** Create professor accounts and automatically dispatch temporary login credentials via email ([`CreateProfessorCard.jsx`](apps/web/src/components/admin/CreateProfessorCard.jsx)).
- **User Directory & Access Control:** Filter users by role (`ALL`, `STUDENT`, `PROFESSOR`, `ADMIN`), change roles, and deactivate or reactivate accounts with self-lockout prevention ([`UserDirectoryTable.jsx`](apps/web/src/components/admin/UserDirectoryTable.jsx), [`admin.service.js`](apps/api/src/services/admin.service.js)).

---

## 3. Interface Preview and Visual Assets

The repository includes the following branding and visual assets in [`apps/web/public/`](apps/web/public/):
- [`apps/web/public/og-image.png`](apps/web/public/og-image.png) — Open Graph social preview banner shown at the top of this README.
- [`apps/web/public/favicon.svg`](apps/web/public/favicon.svg) & [`apps/web/public/apple-touch-icon.png`](apps/web/public/apple-touch-icon.png) — Application icons used across the web client and transactional emails.

> **Note on UI Screenshots:** Full-screen UI screenshots of the Student, Professor, and Admin portals are not currently committed to the repository. Contributors wishing to add screenshots should place them in a `docs/screenshots/` directory and reference views for the Login screen, Student Attendance Hub, Liveness Camera Modal, Professor Live Session Grid, and Admin User Directory.

---

## 4. Technology Stack

Every package and version listed below is verified from [`package.json`](package.json), [`apps/web/package.json`](apps/web/package.json), and [`apps/api/package.json`](apps/api/package.json):

| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React & React DOM | `^19.2.8` | Component UI rendering and state management |
| **Build Tool & Bundler** | Vite (`@vitejs/plugin-react`) | `^8.2.0` | Development server, HMR, and production bundling |
| **Styling** | Tailwind CSS (`@tailwindcss/vite`) | `^4.3.3` | Utility-first responsive styling |
| **Biometric Liveness SDK** | `@liveness/sdk` | `^1.0.7` | Browser active liveness challenges (MediaPipe Face Mesh + TensorFlow.js) |
| **Backend Runtime & Server** | Node.js (ESM) & Express | `^5.2.1` | REST API routing, middleware, and request handling |
| **Database & Migrations** | PostgreSQL (`pg`) & `node-pg-migrate` | `^8.22.0` / `^9.0.0` | Relational data persistence and SQL schema migrations |
| **Authentication & Security** | `jsonwebtoken`, `bcrypt`, `google-auth-library`, `cookie-parser`, `cors`, `express-rate-limit` | `^9.0.3` / `^6.0.0` / `^11.0.2` | JWT cookie sessions, password hashing, Google OAuth 2.0, CORS, and rate limiting |
| **Validation** | Zod | `^4.4.3` | Request payload schema validation |
| **External HTTP & Email** | Axios & Resend | `^1.19.0` / `^6.28.1` | Liveness Cloud API requests and transactional emails |
| **Code Quality** | ESLint | `^10.8.0` | Static analysis and React Hooks linting for `apps/web` |
| **Deployment & Hosting** | GitHub Actions / GitHub Pages & Render | — | Automated static web hosting and Node.js API service deployment |

---

## 5. System Architecture

The application follows a decoupled client-server architecture within an npm workspace monorepo.

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Web as React Web Client<br/>(@liveness/sdk)
    participant API as Express 5 API<br/>(apps/api)
    participant DB as PostgreSQL<br/>Database
    participant SaaS as Liveness Cloud API<br/>(liveness.cloud)

    Student->>Web: Click "Verify Face & Check In"
    Web->>Web: Preload Face Mesh WASM & Recognition Models
    Web->>Student: Prompt randomized challenges (WAITING -> BLINK / TURN_LEFT / TURN_RIGHT -> WAITING)
    Student->>Web: Complete active movements in camera frame
    Web->>Web: Extract 128-D face descriptor & compute integrity hash
    Web->>API: POST /api/check-ins (sessionId, descriptor, challenges, sessionToken, timestamp, integrity)
    API->>API: Validate JWT cookie, account status & Zod checkInSchema
    API->>DB: Verify session is OPEN & not expired, class not archived, student enrolled, no manual override, active biometric enrollment exists
    API->>SaaS: POST /verify-one (x-api-key, targetId = liveness_external_id, livenessResult)
    SaaS-->>API: Verification response (verified, confidence, match.similarity)
    API->>DB: INSERT into check_in_attempts (SUCCESS / FAILURE / ERROR)
    alt verified === true
        API->>DB: UPSERT attendance_records (status = PRESENT, source = LIVENESS)
        API-->>Web: 200 OK { present: true }
    else verified === false
        API-->>Web: 200 OK { present: false, message: "Face not recognized" }
    end
```

### Request Flow Breakdown
1. **Client Interaction:** The React frontend (`apps/web`) communicates with the backend via [`apps/web/src/api.js`](apps/web/src/api.js) using `fetch` with `credentials: "include"` so `httpOnly` JWT cookies are sent automatically.
2. **API Gateway & Rate Limiting:** [`apps/api/src/index.js`](apps/api/src/index.js) applies CORS origin validation, `Cache-Control: no-store` headers on all `/api` routes, and per-user/per-IP rate limiting ([`rate-limit.js`](apps/api/src/middleware/rate-limit.js)).
3. **Authentication & Role Guards:** Protected endpoints verify the JWT cookie ([`auth.js`](apps/api/src/middleware/auth.js)), confirm the user's account is active and does not have a pending mandatory password change ([`check-account-status.js`](apps/api/src/middleware/check-account-status.js)), and enforce role-based access (`STUDENT`, `PROFESSOR`, `ADMIN`).
4. **Controller & Zod Validation:** Controllers parse incoming JSON bodies against Zod schemas in [`apps/api/src/schemas/`](apps/api/src/schemas/) before invoking service-layer logic.
5. **Service & Repository Layers:** Services in [`apps/api/src/services/`](apps/api/src/services/) coordinate business rules, external API calls ([`client.js`](apps/api/src/integrations/liveness/client.js), [`email.service.js`](apps/api/src/services/email.service.js)), and parameterized SQL queries executed via `pg.Pool` in [`apps/api/src/repositories/`](apps/api/src/repositories/).

---

## 6. Project Structure

```text
attendance-app/
├── .github/
│   └── workflows/
│       └── deploy-web.yml              # GitHub Actions CI/CD workflow for GitHub Pages
├── apps/
│   ├── api/                            # Backend Express 5 application
│   │   ├── src/
│   │   │   ├── controllers/            # Express route handlers (auth, admin, classes, sessions, check-in, etc.)
│   │   │   ├── db/
│   │   │   │   ├── migrations/         # Sequential SQL migrations managed by node-pg-migrate
│   │   │   │   ├── db.js               # PostgreSQL connection pool (pg)
│   │   │   │   └── seed-admin.js       # Standalone CLI script to provision initial admin user
│   │   │   ├── integrations/
│   │   │   │   └── liveness/
│   │   │   │       └── client.js       # Axios client for Liveness Cloud API (/enroll, /verify, /verify-one)
│   │   │   ├── middleware/             # JWT authentication, account status check, and rate limiters
│   │   │   ├── repositories/           # Parameterized SQL data-access modules
│   │   │   ├── routes/                 # Express routers mounted under /api
│   │   │   ├── schemas/                # Zod validation schemas for request bodies
│   │   │   ├── services/               # Domain logic and Resend email templates
│   │   │   ├── utils/                  # HTTP error helper and email normalization
│   │   │   └── index.js                # Express server entry point and automatic admin bootstrap
│   │   ├── .env.example                # Backend environment variable template
│   │   └── package.json                # Backend dependencies and migration scripts
│   └── web/                            # Frontend React 19 + Vite 8 application
│       ├── public/
│       │   ├── face_mesh/              # MediaPipe Face Mesh WASM binary and packed assets
│       │   ├── face_recognition/       # 128-D face recognition model manifest and weight shards
│       │   └── mobilenet-v2/           # MobileNetV2 model manifest and weight shards
│       ├── src/
│       │   ├── components/
│       │   │   ├── account/            # Account settings and password change UI
│       │   │   ├── admin/              # Admin portal, user directory, and professor creation
│       │   │   ├── auth/               # Login, registration, email verification, and password reset
│       │   │   ├── layout/             # AppLayout, Header, and responsive Sidebar
│       │   │   ├── liveness/           # LivenessCamera wrapper and directional ProgressBar
│       │   │   ├── professor/          # Professor portal, class detail, session controller, and attendance grids
│       │   │   ├── student/            # Student portal, biometric setup, class detail, and history tables
│       │   │   └── ui/                 # Shared UI primitives (Modal, Badge, Skeleton, StatCard, Icons, etc.)
│       │   ├── context/                # React Context providers for Auth, Toast notifications, and Confirm modals
│       │   ├── utils/                  # URL navigation, class name formatting, and local storage helpers
│       │   ├── api.js                  # Fetch wrapper and domain API client methods
│       │   ├── App.jsx                 # Root view router and role-based portal dispatcher
│       │   ├── LivenessCamera.jsx      # Active liveness scanner modal integrating @liveness/sdk
│       │   └── main.jsx                # React DOM entry point
│       ├── .env.example                # Frontend environment variable template
│       ├── index.html                  # HTML entry point loading face_mesh.js
│       ├── package.json                # Frontend dependencies and build/lint scripts
│       └── vite.config.js              # Vite config with /api proxy and Open Graph URL transform
├── package.json                        # Root npm workspace configuration
└── render.yaml                         # Render deployment blueprint for attendance-api
```

> **Implementation Note:** [`apps/api/src/controllers/biometrics.controller.js`](apps/api/src/controllers/biometrics.controller.js), [`apps/api/src/services/biometrics.service.js`](apps/api/src/services/biometrics.service.js), and [`apps/api/src/repositories/biometrics.repository.js`](apps/api/src/repositories/biometrics.repository.js) are legacy mock files that are **not** mounted by [`apps/api/src/routes/index.js`](apps/api/src/routes/index.js). The active production routes use [`biometric-enrollment.routes.js`](apps/api/src/routes/biometric-enrollment.routes.js) and [`check-in.routes.js`](apps/api/src/routes/check-in.routes.js). Also note that [`apps/web/src/components/student/SessionCheckInCard.jsx`](apps/web/src/components/student/SessionCheckInCard.jsx) is an standalone UUID-based check-in component not currently rendered by [`StudentPortal.jsx`](apps/web/src/components/student/StudentPortal.jsx), which instead triggers check-ins directly from class cards and [`StudentClassDetail.jsx`](apps/web/src/components/student/StudentClassDetail.jsx).

---

## 7. Prerequisites

Before running the project locally, ensure you have the following installed and configured:

1. **Node.js:** Version `20.x` or later (verified in [`.github/workflows/deploy-web.yml`](.github/workflows/deploy-web.yml)).
2. **npm:** Version `10.x` or later (supports `workspaces` defined in root [`package.json`](package.json)).
3. **PostgreSQL:** Version `14+` or a managed PostgreSQL instance (such as Neon) with support for the `pgcrypto` extension (`gen_random_uuid()`).
4. **Liveness Cloud API Credentials (Required for Biometric Enrollment & Check-In):**
   - An active `LIVENESS_API_URL` and `LIVENESS_API_KEY` from [Liveness Cloud](https://liveness.cloud/) (or a locally hosted Liveness API instance).
5. **Optional External Services:**
   - **Resend API Key (`RESEND_API_KEY`):** Required to send email verification codes, temporary professor passwords, and password reset links. If omitted, the backend logs a warning and skips sending emails.
   - **Google OAuth Client ID (`GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID`):** Required only if enabling "Sign in with Google".
6. **Webcam / Device Camera:** Required in a secure context (`http://localhost` or `https://`) with WebAssembly and WebGL enabled to test biometric enrollment and attendance check-ins.

---

## 8. Installation and Local Development

Follow these steps from the root of the repository:

### Step 1: Clone the Repository
```bash
git clone https://github.com/LourdenB15/attendance-app.git
cd attendance-app
```

### Step 2: Install Workspace Dependencies
Run `npm install` once at the repository root to install dependencies for both `apps/api` and `apps/web`:
```bash
npm install
```

### Step 3: Configure Environment Variables
Create `.env` files for both the backend and frontend from their `.env.example` templates:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edit `apps/api/.env` and `apps/web/.env` with your local configuration (see [Section 9](#9-environment-variables-and-api-configuration) for full details). Ensure `PORT=3001` in `apps/api/.env` matches `VITE_API_URL=http://localhost:3001` in `apps/web/.env`.

### Step 4: Run Database Migrations
Make sure your PostgreSQL database is running and `DATABASE_URL` is set in `apps/api/.env`, then apply all SQL migrations from the repository root:
```bash
npm run db:migrate
```

### Step 5: Seed the Administrator Account (Optional)
The API server automatically runs `ensureAdminAccount()` on startup when `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` are set in `apps/api/.env`. You can also run the standalone seeder explicitly:
```bash
npm run seed:admin -w apps/api
```

### Step 6: Start the Backend and Frontend Servers
Open two separate terminals at the repository root:

**Terminal 1 — Backend API (`http://localhost:3001`):**
```bash
npm run dev:api
```

**Terminal 2 — Frontend Web App (`http://localhost:5173`):**
```bash
npm run dev:web
```

Open **`http://localhost:5173`** in your browser.

---

## 9. Environment Variables and API Configuration

### Backend Environment Variables (`apps/api/.env`)

Based on [`apps/api/.env.example`](apps/api/.env.example) and references in [`apps/api/src/`](apps/api/src/):

| Variable | Required | Default in Code | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string used by `pg.Pool` and `node-pg-migrate`. |
| `JWT_SECRET` | **Yes** | `"default_jwt_secret"` (in `auth.service.js` only; required by `auth.js` middleware) | Secret key used to sign and verify `httpOnly` session JWTs. Must be set in all environments. |
| `LIVENESS_API_KEY` | **Yes** (for biometrics) | — | Server-side API key sent in the `x-api-key` header to the Liveness Cloud API. |
| `LIVENESS_API_URL` | **Yes** (for biometrics) | — | Base URL of the Liveness Cloud API (e.g., `https://api.liveness.cloud/api/liveness` or `http://localhost:3000/api/liveness`). |
| `PORT` | **Yes** | — (`3001` in `.env.example`) | Port on which the Express server listens. |
| `ALLOWED_ORIGINS` | No | `http://localhost:5173` | Comma-separated list of allowed CORS origins (e.g., `http://localhost:5173,https://attendance-app.online`). |
| `APP_URL` | No | `https://attendance-app.online` | Public frontend base URL used when generating password reset and sign-in links in emails. |
| `ADMIN_NAME` | No | — | Full name for the automatically provisioned `ADMIN` account on server startup. |
| `ADMIN_EMAIL` | No | — | Email address for the initial `ADMIN` account. Also used to elevate matching Google OAuth logins to `ADMIN`. |
| `ADMIN_PASSWORD` | No | — | Initial temporary password for the `ADMIN` account (forces password change on first sign-in). |
| `GOOGLE_CLIENT_ID` | No | — | Google OAuth 2.0 Web Client ID used by `google-auth-library` to verify ID tokens. |
| `RESEND_API_KEY` | No | — | Resend API key for transactional emails (verification codes, password resets, professor temporary passwords). |
| `RESEND_FROM_EMAIL` | No | `onboarding@resend.dev` | Verified sender email address used by Resend. |
| `NODE_ENV` | No | `development` | Set to `production` in deployed environments to enable `Secure` and `SameSite=None` cookies and stricter API rate limits. |
| `API_RATE_LIMIT_MAX` | No | `5000` (dev) / `1500` (prod) | Maximum general API requests per user/IP per 15-minute window ([`rate-limit.js`](apps/api/src/middleware/rate-limit.js)). |
| `AUTH_RATE_LIMIT_MAX` | No | `300` | Maximum auth endpoint requests per IP per 15-minute window. |
| `LOGIN_EMAIL_RATE_LIMIT_MAX` | No | `10` | Maximum failed login attempts per email address per 15-minute window. |
| `EMAIL_SEND_RATE_LIMIT_MAX` | No | `5` | Maximum verification or password-reset emails per address per 1-hour window. |

#### Example `apps/api/.env`
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/attendance_app
JWT_SECRET=replace_with_a_long_random_secret_string
LIVENESS_API_KEY=your_liveness_cloud_api_key
LIVENESS_API_URL=http://localhost:3000/api/liveness
PORT=3001
APP_URL=http://localhost:5173
ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@school.edu
ADMIN_PASSWORD=ChangeMeOnFirstLogin123!
ALLOWED_ORIGINS=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Frontend Environment Variables (`apps/web/.env`)

Based on [`apps/web/.env.example`](apps/web/.env.example), [`apps/web/src/api.js`](apps/web/src/api.js), and [`apps/web/vite.config.js`](apps/web/vite.config.js):

| Variable | Required | Default in Code | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | No (in dev) / **Yes** (in prod) | `http://localhost:3001` (via Vite dev proxy) | Base URL of the backend Express server (without trailing `/api`). Note: `apps/web/.env.example` lists `http://localhost:5000`, so update it to `http://localhost:3001` if your API runs on port `3001`. |
| `VITE_GOOGLE_CLIENT_ID` | No | — | Google OAuth 2.0 Client ID matching `GOOGLE_CLIENT_ID` on the backend. If unset, the Google sign-in button is disabled. |
| `VITE_APP_URL` | No | `https://attendance-app.online` | Public URL used by Vite's HTML plugin to rewrite Open Graph meta tag URLs during build. |
| `VITE_BASE_PATH` | No | `/` | Base public path configured in `vite.config.js`. |

#### Example `apps/web/.env`
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_API_URL=http://localhost:3001
VITE_APP_URL=http://localhost:5173
```

---

## 10. Database and Data Flow

The PostgreSQL schema is managed via sequential SQL migrations in [`apps/api/src/db/migrations/`](apps/api/src/db/migrations/) using `node-pg-migrate`.

### Entity-Relationship Diagram

```mermaid
erDiagram
    users ||--o{ classes : "teaches (professor_id)"
    users ||--o{ enrollments : "enrolls in (student_id)"
    users ||--o{ biometric_enrollments : "registers (student_id)"
    users ||--o{ attendance_sessions : "opens (opened_by)"
    users ||--o{ check_in_attempts : "attempts (student_id)"
    users ||--o{ attendance_records : "student (student_id)"
    users ||--o{ attendance_records : "recorded by (recorded_by)"
    users ||--o{ password_reset_tokens : "requests (user_id)"
    users ||--o{ email_verification_tokens : "verifies (user_id)"

    classes ||--o{ enrollments : "has roster (class_id)"
    classes ||--o{ attendance_sessions : "hosts (class_id)"

    attendance_sessions ||--o{ check_in_attempts : "logs (session_id)"
    attendance_sessions ||--o{ attendance_records : "records (session_id)"

    check_in_attempts |o--o| attendance_records : "verifies (check_in_attempt_id)"

    users {
        uuid id PK
        user_role role "STUDENT | PROFESSOR | ADMIN"
        varchar full_name
        varchar email UK
        varchar password_hash "nullable for Google OAuth users"
        varchar google_id UK
        boolean is_email_verified
        boolean must_change_password
        boolean is_active
        integer token_version
        text avatar_url
        timestamptz created_at
        timestamptz updated_at
    }

    classes {
        uuid id PK
        uuid professor_id FK
        varchar name
        varchar section
        varchar semester
        varchar join_code UK
        boolean is_archived
        timestamptz created_at
    }

    enrollments {
        uuid id PK
        uuid class_id FK
        uuid student_id FK
        enrollment_status status "ACTIVE | DROPPED"
        enrollment_source enrolled_via "SELF_ENROLLED | PROFESSOR_ADDED"
        timestamptz enrolled_at
    }

    attendance_sessions {
        uuid id PK
        uuid class_id FK
        uuid opened_by FK
        varchar label
        session_status status "OPEN | CLOSED"
        timestamptz opened_at
        timestamptz expires_at
        timestamptz closed_at
    }

    biometric_enrollments {
        uuid id PK
        uuid student_id FK
        uuid liveness_external_id UK
        biometric_enrollment_status status "ACTIVE | REVOKED"
        timestamptz enrolled_at
        timestamptz revoked_at
    }

    check_in_attempts {
        uuid id PK
        uuid session_id FK
        uuid student_id FK
        timestamptz attempted_at
        check_in_outcome outcome "SUCCESS | FAILURE | ERROR"
        numeric similarity
        varchar confidence_level
        boolean identity_match
        jsonb saas_raw_response
    }

    attendance_records {
        uuid id PK
        uuid session_id FK
        uuid student_id FK
        attendance_status status "PRESENT | ABSENT"
        attendance_source source "LIVENESS | MANUAL_OVERRIDE"
        uuid check_in_attempt_id FK
        uuid recorded_by FK
        varchar override_reason
        timestamptz recorded_at
    }
```

### Key Database Constraints and Integrity Rules
- **Single Open Session Per Class:** A partial unique index `attendance_sessions_one_open_per_class_idx` on `attendance_sessions(class_id) WHERE status = 'OPEN'` ensures a class can only have one open session at a time. Opening a new session automatically closes any expired or previously open session for that class ([`sessions.service.js`](apps/api/src/services/sessions.service.js)).
- **Single Active Biometric Enrollment Per Student:** A partial unique index `biometric_enrollments_one_active_per_student_idx` on `biometric_enrollments(student_id) WHERE revoked_at IS NULL` guarantees one active biometric reference per student. Re-enrolling revokes the previous record within a database transaction ([`biometric-enrollments.repository.js`](apps/api/src/repositories/biometric-enrollments.repository.js)).
- **Unique Class Sections per Professor:** `UNIQUE (professor_id, name, semester, section)` prevents duplicate class sections under the same instructor.
- **Audit Logging of Check-In Attempts:** Every biometric verification call to Liveness Cloud—whether `SUCCESS`, `FAILURE`, or `ERROR`—is recorded in `check_in_attempts` along with similarity score, confidence level, and the raw JSON response (`saas_raw_response`).

---

## 11. Liveness Cloud API Integration

The application integrates with [Liveness Cloud](https://liveness.cloud/) through two components:
1. **Browser SDK (`@liveness/sdk` in [`apps/web/src/LivenessCamera.jsx`](apps/web/src/LivenessCamera.jsx))**
2. **Backend REST Client ([`apps/api/src/integrations/liveness/client.js`](apps/api/src/integrations/liveness/client.js))**

### Client-Side Liveness Capture (`@liveness/sdk`)
When a student initiates face enrollment or session check-in:
1. `LivenessCamera` initializes `LivenessSDK` (`headTurnThreshold: 0.4`, `challengeTimeout: 10000`, `minFaceSize: 0.10`, `maxFaceSize: 0.75`) and preloads the local MediaPipe Face Mesh assets from `/face_mesh/*` and recognition weights from `/face_recognition/*`.
2. When `sdk.start(videoEl, canvasEl)` is called with `challenges: null`, the SDK generates a randomized challenge sequence:
   ```text
   ["WAITING", ...shuffled(["BLINK", "TURN_LEFT", "TURN_RIGHT"]), "WAITING"]
   ```
3. Upon passing all challenges, the SDK emits a `success` event containing:
   - `descriptor`: `number[128]` (128-D normalized facial feature vector)
   - `sessionToken`: `string`
   - `timestamp`: `number`
   - `challenges`: `string[]` (completed challenge sequence)
   - `integrity`: `string` (client-computed hash over the descriptor, token, and timestamp)

### Server-Side Verification (`apps/api/src/integrations/liveness/client.js`)
The backend validates the payload with Zod (requiring all 128 descriptor dimensions and confirming `"BLINK"`, `"TURN_LEFT"`, and `"TURN_RIGHT"` are present in `challenges`) and forwards it to `LIVENESS_API_URL` with an `x-api-key: LIVENESS_API_KEY` header and a 15-second timeout:

- **Biometric Enrollment (`POST /enroll`):**
  - Triggered by `POST /api/biometric-enrollments` ([`biometric-enrollment.service.js`](apps/api/src/services/biometric-enrollment.service.js)).
  - Sends `{ name: student.full_name, ...livenessResult }` to `${LIVENESS_API_URL}/enroll`.
  - Stores the returned `saasEnrollment.id` in `biometric_enrollments.liveness_external_id`.
- **Attendance Verification (`POST /verify-one`):**
  - Triggered by `POST /api/check-ins` ([`check-in.service.js`](apps/api/src/services/check-in.service.js)).
  - Looks up the student's active `liveness_external_id` and sends `{ ...livenessResult, targetId: enrollment.liveness_external_id }` to `${LIVENESS_API_URL}/verify-one`.
  - Evaluates `verifyResponse.verified === true`, logs the attempt in `check_in_attempts`, and if verified, upserts a `PRESENT` record in `attendance_records`.

### Failure States and Error Handling
- **Missing API Credentials (`500 Internal Server Error`):** Thrown if `LIVENESS_API_KEY` or `LIVENESS_API_URL` is missing in `apps/api/.env`.
- **Upstream Rejections (`502 Bad Gateway`):** Returned when Liveness Cloud responds with an HTTP error (e.g., invalid descriptor or failed integrity check), forwarding the upstream message and logging an `ERROR` row in `check_in_attempts`.
- **Network / Timeout Errors (`503 Service Unavailable`):** Returned if the Liveness Cloud service is unreachable or exceeds the 15-second timeout.
- **Identity Mismatch (`200 OK` with `{ present: false }`):** Returned when `verifyResponse.verified` is `false`, logging a `FAILURE` attempt without marking the student present.

---

## 12. API Reference Summary

All endpoints are prefixed with `/api` (plus `/health` at the root):

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Health check returning `{ status: "ok" }` |
| `POST` | `/api/auth/register` | Public | Register a new student account and send a 6-digit verification email |
| `POST` | `/api/auth/verify-email` | Public | Verify a student's email using the 6-digit code and sign in |
| `POST` | `/api/auth/resend-verification` | Public | Resend the 6-digit email verification code |
| `POST` | `/api/auth/login` | Public | Authenticate with email and password |
| `POST` | `/api/auth/google` | Public | Authenticate or register via Google OAuth ID token |
| `POST` | `/api/auth/logout` | Public | Clear the `httpOnly` session cookie |
| `GET` | `/api/auth/me` | Authenticated | Return the current authenticated user's profile |
| `PATCH` | `/api/auth/profile` | Authenticated | Update the current user's full name |
| `POST` | `/api/auth/change-password` | Authenticated | Change password (clears `must_change_password` and increments `token_version`) |
| `POST` | `/api/auth/forgot-password` | Public | Request a 30-minute password reset link via email |
| `POST` | `/api/auth/reset-password/validate` | Public | Validate a password reset token before showing the reset form |
| `POST` | `/api/auth/reset-password` | Public | Set a new password using a valid reset token |
| `GET` | `/api/admin/users` | `ADMIN` | List users (supports optional `?role=STUDENT\|PROFESSOR\|ADMIN`) |
| `POST` | `/api/admin/professors` | `ADMIN` | Create a professor account and email a temporary password |
| `PATCH` | `/api/admin/users/:id/role` | `ADMIN` | Update a user's role (`STUDENT`, `PROFESSOR`, `ADMIN`) |
| `POST` | `/api/admin/users/:id/deactivate` | `ADMIN` | Deactivate a user account |
| `POST` | `/api/admin/users/:id/reactivate` | `ADMIN` | Reactivate a deactivated user account |
| `GET` | `/api/biometric-enrollments/status` | `STUDENT` | Check whether the student has an active biometric enrollment |
| `POST` | `/api/biometric-enrollments` | `STUDENT` | Enroll or update the student's biometric face descriptor |
| `POST` | `/api/check-ins` | `STUDENT` | Submit an active liveness scan to check into an open session |
| `GET` | `/api/classes` | `PROFESSOR` | List all classes taught by the authenticated professor |
| `POST` | `/api/classes` | `PROFESSOR` | Create a new class section and generate a unique join code |
| `PATCH` | `/api/classes/:id` | `PROFESSOR` | Update a class's name, section, or semester |
| `POST` | `/api/classes/:id/archive` | `PROFESSOR` | Archive a class (closes any open session) |
| `POST` | `/api/classes/:id/unarchive` | `PROFESSOR` | Unarchive a class |
| `GET` | `/api/classes/:classId/students` | `PROFESSOR`, `STUDENT` | List enrolled students for a class |
| `POST` | `/api/classes/:classId/students/:studentId/drop` | `PROFESSOR` | Drop a student from a class roster |
| `POST` | `/api/classes/:classId/students/:studentId/restore` | `PROFESSOR` | Restore a dropped student to a class roster |
| `GET` | `/api/classes/:classId/attendance-history` | `PROFESSOR` | Get past sessions with attendance counts for a class |
| `GET` | `/api/classes/:classId/attendance-summary` | `PROFESSOR` | Get full section attendance matrix (sessions + per-student records) |
| `GET` | `/api/sessions/active` | `PROFESSOR` | Get the currently open session for `?classId=<uuid>` |
| `POST` | `/api/sessions` | `PROFESSOR` | Open a new attendance session for a class |
| `POST` | `/api/sessions/:id/close` | `PROFESSOR` | Close an open attendance session |
| `GET` | `/api/sessions/:id/attendance` | `PROFESSOR` | Get the live attendance roster for a specific session |
| `POST` | `/api/sessions/:id/attendance` | `PROFESSOR` | Manually override a student's attendance (`PRESENT` / `ABSENT`) |
| `GET` | `/api/enrollments` | `STUDENT` | List all classes the student is enrolled in (with active session status) |
| `POST` | `/api/enrollments` | `STUDENT` | Join a class using a `joinCode` |
| `GET` | `/api/attendance` | `STUDENT` | List the student's attendance history across all classes |

> **Frontend vs. Backend Note on Attendance Statuses:** While [`StudentClassDetail.jsx`](apps/web/src/components/student/StudentClassDetail.jsx) and [`AttendanceHistoryTable.jsx`](apps/web/src/components/student/AttendanceHistoryTable.jsx) include badge rendering fallback logic for a `"LATE"` status string, the PostgreSQL `attendance_status` enum ([`1785995342659_init-schema.sql`](apps/api/src/db/migrations/1785995342659_init-schema.sql)) and backend Zod schema ([`sessions.schema.js`](apps/api/src/schemas/sessions.schema.js)) strictly store and validate `PRESENT` and `ABSENT`.

---

## 13. Available Scripts

### Root Workspace Scripts ([`package.json`](package.json))
Run from the repository root:

| Command | Underlying Script | Purpose |
| :--- | :--- | :--- |
| `npm run dev:web` | `npm run dev -w apps/web` | Start the Vite frontend dev server on port `5173` |
| `npm run dev:api` | `npm run dev -w apps/api` | Start the Express API server with `node --watch` |
| `npm run db:migrate` | `npm run migrate:up -w apps/api` | Apply pending PostgreSQL migrations via `node-pg-migrate` |

### Backend Scripts ([`apps/api/package.json`](apps/api/package.json))
Run from `apps/api` or via `npm run <script> -w apps/api`:

| Command | Purpose |
| :--- | :--- |
| `npm run start -w apps/api` | Start the Express API server (`node src/index.js`) |
| `npm run dev -w apps/api` | Start the Express API server in watch mode (`node --watch src/index.js`) |
| `npm run seed:admin -w apps/api` | Provision the initial `ADMIN` account defined in `apps/api/.env` |
| `npm run migrate:up -w apps/api` | Run all pending up migrations in `apps/api/src/db/migrations` |
| `npm run migrate:down -w apps/api` | Roll back the most recent database migration |
| `npm run migrate:create -w apps/api -- <name>` | Create a new SQL migration file in `apps/api/src/db/migrations` |

### Frontend Scripts ([`apps/web/package.json`](apps/web/package.json))
Run from `apps/web` or via `npm run <script> -w apps/web`:

| Command | Purpose |
| :--- | :--- |
| `npm run dev -w apps/web` | Start the Vite development server |
| `npm run build -w apps/web` | Build the production client bundle into `apps/web/dist` |
| `npm run lint -w apps/web` | Run ESLint across `apps/web` |
| `npm run preview -w apps/web` | Locally preview the production build |

---

## 14. Troubleshooting

| Issue / Error Message | Cause | Solution |
| :--- | :--- | :--- |
| `Liveness integration is not configured — set LIVENESS_API_KEY and LIVENESS_API_URL in apps/api/.env` (`500`) | `LIVENESS_API_KEY` or `LIVENESS_API_URL` is missing or empty in `apps/api/.env`. | Set both variables in `apps/api/.env` and restart the API server. |
| `Liveness service is unreachable` (`503`) or `502 Bad Gateway` | The backend cannot reach `LIVENESS_API_URL` or the API key is invalid. | Verify `LIVENESS_API_URL` is reachable from the API host and `LIVENESS_API_KEY` is valid. |
| Frontend requests fail with `502` / `ECONNREFUSED` in local development | Port mismatch between `apps/api/.env` (`PORT=3001`) and `apps/web/.env` (`VITE_API_URL=http://localhost:5000` in `.env.example`). | Set `VITE_API_URL=http://localhost:3001` in `apps/web/.env` (or omit it in local dev so `vite.config.js` defaults to `http://localhost:3001`). |
| CORS error or `401 Authentication required` after login in production | `ALLOWED_ORIGINS` does not match the frontend origin, or `NODE_ENV` is not `production` when using cross-site cookies. | Set `ALLOWED_ORIGINS` in `apps/api/.env` (without trailing slashes) and set `NODE_ENV=production` so cookies use `SameSite=None; Secure`. |
| Camera fails to start (`CAMERA_ACCESS_DENIED` or `BROWSER_NOT_SUPPORTED`) | Browser blocked camera permissions or the page was loaded over insecure `http://` on a non-localhost IP. | Grant camera permissions in the browser and access the app via `http://localhost:5173` or `https://`. |
| `Active liveness challenges (BLINK, TURN_LEFT, TURN_RIGHT) are required` (`400`) | A stale cached frontend bundle or manual request submitted incomplete challenges. | Hard-refresh the browser (`Ctrl+Shift+R`) so the client runs the full challenge sequence. |
| Verification emails or temporary passwords are not arriving | `RESEND_API_KEY` is unset, or `RESEND_FROM_EMAIL` uses an unverified domain in Resend. | Configure a valid `RESEND_API_KEY` and verified sender domain in `apps/api/.env`. |

---

## 15. Security and Privacy

### Implemented Security Controls
- **`httpOnly` Cookie Sessions & Token Versioning:** JWTs are stored in `httpOnly` cookies (`SameSite=Lax` in development, `SameSite=None; Secure` in production) with a 24-hour expiration. Password changes and resets increment `users.token_version`, invalidating previously issued tokens ([`auth.service.js`](apps/api/src/services/auth.service.js)).
- **Hashed Passwords & Single-Use Tokens:** Passwords are hashed with `bcrypt` (10 salt rounds). Email verification codes (15-minute expiry) and password reset tokens (30-minute expiry) are SHA-256 hashed (`crypto.createHash("sha256")`) before being stored in PostgreSQL—plaintext tokens are never persisted in the database.
- **School-Network-Aware Rate Limiting:** [`rate-limit.js`](apps/api/src/middleware/rate-limit.js) keys general API requests by authenticated user ID (`user:<uuid>`) rather than only by IP address so an entire classroom sharing one school NAT IP does not exhaust a single bucket, while failed logins and email dispatches are rate-limited per target email address.
- **No Raw Image Storage:** Camera video frames are processed in browser memory by `@liveness/sdk`. Only the 128-number descriptor array and challenge metadata are sent to the backend and Liveness Cloud API.
- **Server-Side Secret Isolation:** `LIVENESS_API_KEY`, `DATABASE_URL`, `JWT_SECRET`, and `RESEND_API_KEY` reside strictly in `apps/api` and are never exposed to the browser bundle.

### Operational Guidance
- Never commit `.env` files or real API keys to version control (`.env` files are excluded via [`.gitignore`](.gitignore)).
- Always change the initial `ADMIN_PASSWORD` immediately upon first login (enforced automatically by `must_change_password`).
- Serve both the frontend and backend over HTTPS in production.

---

## 16. Deployment

### Frontend Deployment — GitHub Pages ([`.github/workflows/deploy-web.yml`](.github/workflows/deploy-web.yml))
The frontend is automatically built and deployed to GitHub Pages whenever changes affecting `apps/web/**`, `package.json`, `package-lock.json`, or the workflow file are pushed to `main`:
1. Checks out the repository and sets up Node.js 20 with npm caching.
2. Runs `npm ci` and builds the web app via `npm run build -w apps/web`.
3. Injects repository variables `vars.VITE_API_URL` and `vars.VITE_GOOGLE_CLIENT_ID` along with `VITE_APP_URL="https://attendance-app.online"`.
4. Uploads `apps/web/dist` and deploys to GitHub Pages.

### Backend Deployment — Render ([`render.yaml`](render.yaml))
The backend is configured as a Render Web Service (`attendance-api`):
- **Root Directory:** `apps/api`
- **Build Command:** `npm install && npm run migrate:up` (automatically applies pending SQL migrations on every deploy)
- **Start Command:** `npm start` (`node src/index.js`)
- **Required Render Environment Variables:** Set `DATABASE_URL` (e.g., Neon PostgreSQL connection string), `LIVENESS_API_KEY`, `LIVENESS_API_URL`, `ALLOWED_ORIGINS`, `APP_URL`, `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `GOOGLE_CLIENT_ID`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL` in the Render Dashboard (`JWT_SECRET` is auto-generated by `render.yaml`).

---

## 17. Testing and Code Quality

### Current Quality Checks
- **Frontend Linting (ESLint 10):** Configured in [`apps/web/eslint.config.js`](apps/web/eslint.config.js) with `@eslint/js`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.
  ```bash
  npm run lint -w apps/web
  ```
- **Production Bundle Verification:**
  ```bash
  npm run build -w apps/web
  ```

### Automated Tests Status
No automated unit or integration test suite (e.g., Vitest, Jest, or Supertest) is currently configured in `apps/api` or `apps/web`. Recommended areas for future test coverage include:
- Unit tests for Zod validation schemas (`check-in.schema.js`, `biometric-enrollment.schema.js`, `auth.schema.js`).
- Integration tests for `check-in.service.js` covering session expiration, manual override protection, and Liveness Cloud error handling.
- End-to-end tests for role-based navigation and authentication flows.

---

## 18. Roadmap

### Implemented and Active
- Role-based portals for Students, Professors, and Administrators.
- Email verification, password reset, and Google OAuth 2.0 authentication.
- Active 3D liveness detection (`BLINK`, `TURN_LEFT`, `TURN_RIGHT`) for both enrollment and session check-in.
- Live session management, real-time roster polling, manual attendance overrides, and section attendance summaries.

### Potential Future Enhancements
- Remove or consolidate unused legacy mock files (`biometrics.controller.js`, `biometrics.service.js`, `biometrics.repository.js`) and unused standalone components (`SessionCheckInCard.jsx`).
- Add automated unit and API integration tests in `apps/api` and `apps/web`.
- Add CSV/Excel export for the Professor Section Attendance History matrix.
- Add database-level support for a `LATE` attendance status if time-threshold tardiness tracking is desired.

---

## 19. Contributing

1. **Fork and Clone:** Fork the repository and clone your fork locally.
2. **Create a Feature Branch:** Branch off `development` or `main` using a descriptive branch name (e.g., `feat/csv-export` or `fix/session-timer`).
3. **Follow Commit Conventions:** This repository uses Conventional Commits (`feat:`, `fix:`, `perf:`, `revert:`, `docs:`).
4. **Validate Changes Before Submitting:**
   - Ensure `npm run lint -w apps/web` and `npm run build -w apps/web` complete with zero errors.
   - Verify database migrations run cleanly (`npm run db:migrate`) if schema changes are introduced.
5. **Open a Pull Request:** Provide a clear summary of your changes and any environment or migration requirements.

---

## 20. License and Acknowledgments

### License
This project is licensed under the **ISC License** as declared in [`package.json`](package.json) and [`apps/api/package.json`](apps/api/package.json).

### Acknowledgments
- [**Liveness Cloud (`@liveness/sdk`)**](https://liveness.cloud/) for browser-based active liveness detection and 128-D facial verification.
- [**MediaPipe Face Mesh**](https://developers.google.com/mediapipe) and [**TensorFlow.js**](https://www.tensorflow.org/js) for client-side landmark tracking and feature extraction.
- [**Resend**](https://resend.com/) for transactional email delivery.

---

## 21. Authors and Collaborators

Developed and maintained by:

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/LourdenB15">
        <img src="https://avatars.githubusercontent.com/u/103452827?v=4" width="90" alt="LourdenB15" style="border-radius: 50%;" /><br />
        <sub><b>@LourdenB15</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/carlotata">
        <img src="https://avatars.githubusercontent.com/u/161675826?v=4" width="90" alt="Carl Aviso" style="border-radius: 50%;" /><br />
        <sub><b>Carl Aviso (@carlotata)</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/johnpaulpatigas">
        <img src="https://avatars.githubusercontent.com/u/142099061?v=4" width="90" alt="John Paul Patigas" style="border-radius: 50%;" /><br />
        <sub><b>John Paul Patigas (@johnpaulpatigas)</b></sub>
      </a>
    </td>
  </tr>
</table>

- [**@LourdenB15**](https://github.com/LourdenB15) — Repository Owner & Core Developer
- [**Carl Aviso (@carlotata)**](https://github.com/carlotata) — Core Collaborator & Full-Stack Developer
- [**John Paul Patigas (@johnpaulpatigas)**](https://github.com/johnpaulpatigas) — Collaborator & Author of [Liveness Cloud](https://liveness.cloud/) (`@liveness/sdk`)
