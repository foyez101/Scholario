# Scholario

**Assignment & Submission Management System** — a role-based web application for a school or college, where teachers create and grade assignments, and students submit their work and track feedback.

🔗 **Live app:** https://scholario-two.vercel.app
🔗 **Live API:** https://scholario-v18n.onrender.com/api
🔗 **Repository:** https://github.com/foyez101/Scholario

> The backend runs on Render's free tier, which spins down after periods of inactivity. The **first** request after a while may take 30–60 seconds to respond while it wakes up — this is expected, not a bug.

---

## Overview

Three roles use the system, each with their own permissions and views:

- **Admin** — manages classes, subjects, teacher assignments, and student enrollments
- **Teacher** — creates, publishes, and grades assignments for the classes they teach
- **Student** — views published assignments for their class, submits and updates work before the deadline, and sees marks and feedback

## Features

**Admin**
- Create and manage classes and subjects
- Assign teachers to a subject within a specific class
- Enroll students into classes
- View all users by role

**Teacher**
- Create assignments (title, description, deadline, max marks) for a subject/class they're assigned to teach
- Save as draft or publish when ready
- Edit, delete, or unpublish an assignment
- View every submission for an assignment and grade it with marks + feedback
- Editing a graded submission automatically clears the old grade and flags it for re-review

**Student**
- View only published assignments for their enrolled class
- See a clear completion status per assignment (Not submitted / Submitted / Graded / Needs review)
- Submit an answer, and update it any time before the deadline
- View marks and feedback once graded

**Platform-wide**
- JWT-based authentication with bcrypt password hashing
- Role-based route protection, enforced on the backend (not just hidden in the UI)
- Clean, translated error messages (no raw database errors ever reach the frontend)
- Toast notifications for save/publish/delete/grade actions

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, JavaScript |
| Backend | Express 4, Node.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT (jsonwebtoken) + bcrypt |
| Validation | express-validator |
| HTTP client | axios |
| Hosting | Vercel (frontend) · Render (backend) · Neon (database) |

## Project Structure

```
Scholario/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Data model
│   │   ├── migrations/
│   │   └── create-admin.js      # One-off script to seed the first admin account
│   ├── src/
│   │   ├── config/db.js         # Shared Prisma client
│   │   ├── controllers/         # auth, admin, assignment, submission
│   │   ├── middleware/          # auth, role, error handling
│   │   ├── routes/
│   │   └── app.js
│   └── server.js
├── frontend/
│   ├── app/                     # Pages (App Router)
│   │   ├── login/, register/, dashboard/
│   │   ├── assignments/, assignments/new/, assignments/[id]/
│   │   └── admin/                # classes, subjects, teachers, students
│   ├── components/               # Navbar, StampBadge, SubmissionRow, etc.
│   └── lib/                      # api.js, AuthContext, ToastContext
└── README.md
```

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (LTS)
- [PostgreSQL](https://www.postgresql.org/download/) installed locally, **or** a free [Neon](https://neon.tech) connection string
- Git

### 1. Clone the repository
```bash
git clone https://github.com/foyez101/Scholario.git
cd Scholario
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```
Fill in `backend/.env`:
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/scholario"
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
PORT=5000
```

### 3. Database setup
```bash
npx prisma migrate dev
node prisma/create-admin.js
```
The first command creates all tables. The second creates one admin account
(`admin@scholario.com` / `admin123`) — admins can't self-register through the app,
by design (see [Assumptions](#assumptions)).

### 4. Run the backend
```bash
npm run dev
```
API available at `http://localhost:5000/api`.

### 5. Frontend setup
```bash
cd ../frontend
npm install
cp .env.local.example .env.local
```
`frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 6. Run the frontend
```bash
npm run dev
```
App available at `http://localhost:3000`.

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@scholario.com` | `admin123` |
| Teacher | *register a new account* | — |
| Student | *register a new account* | — |

Teacher and Student accounts aren't pre-seeded yet (see [Known Limitations](#known-limitations)).
To try those roles: register a new account at `/register` and choose the role, then
log in as Admin to assign the teacher to a subject/class, or enroll the student into a class.

## Running Tests

Automated tests are not implemented yet — see [Known Limitations](#known-limitations).

## API Overview

All routes are prefixed with `/api`.

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register as Student or Teacher |
| POST | `/auth/login` | Public | Log in, returns a JWT |
| GET | `/auth/me` | Logged in | Current user's profile |
| GET/POST | `/admin/classes`, `/admin/subjects` | Admin | Manage classes and subjects |
| POST | `/admin/teacher-assignments` | Admin | Assign a teacher to a subject/class |
| POST | `/admin/enrollments` | Admin | Enroll a student into a class |
| GET/POST | `/assignments` | Role-filtered | List / create assignments |
| PATCH | `/assignments/:id/publish` | Teacher (owner) | Toggle draft/published |
| GET/POST | `/submissions` | Role-filtered | List / create submissions |
| PATCH | `/submissions/:id/grade` | Teacher (owner) | Grade with marks + feedback |

## Assumptions

- Built with **Express + Prisma** instead of ASP.NET Core, and **PostgreSQL** instead of
  MongoDB, per the brief's allowance for equivalent technologies suitable to the project —
  PostgreSQL's relational model fits this domain well (users, classes, assignments, and
  submissions all reference one another).
- Admin accounts are never created through public registration — only Student and Teacher
  can self-register. The first admin is seeded directly via `prisma/create-admin.js`.
- A teacher can only create or manage assignments for a subject/class combination they are
  actually assigned to teach.
- A student can only see and act on assignments belonging to a class they're enrolled in.

## Known Limitations

- No automated test suite yet (Jest + Supertest planned)
- No Swagger/OpenAPI documentation page yet
- No seed script for demo Teacher/Student accounts — only the Admin account is seeded;
  other roles must be created manually via registration
- Free-tier hosting trade-offs: the Render backend spins down after ~15 minutes of
  inactivity (cold start delay on the next request), and the Neon database scales to
  zero when idle (a brief delay on the first query after inactivity)

## Author

**Foyez** ([@foyez101](https://github.com/foyez101))
