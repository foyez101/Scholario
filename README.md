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

**Authentication & Security**
- JWT-based authentication with bcrypt password hashing
- Role-based route protection, enforced on the backend (not just hidden in the UI)
- Email verification — a 6-digit code is emailed to any new user, to any real email address; the account can't log in until it's verified
- Password reset via emailed code
- Password strength requirements (minimum length, uppercase, lowercase, number, special character), enforced on both frontend and backend
- Confirm-password field and a show/hide password toggle on every password field
- Clear, translated error messages — no raw database errors ever reach the frontend
- Distinguishes real network/timeout failures from invalid-credential errors, with a "server may be waking up" hint during Render cold starts

**Platform-wide**
- Toast notifications for save/publish/delete/grade actions

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, JavaScript |
| Backend | Express 4, Node.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT (jsonwebtoken) + bcrypt |
| Email | Gmail API (OAuth2), via `googleapis` |
| Validation | express-validator |
| HTTP client | axios |
| Hosting | Vercel (frontend) · Render (backend) · Neon (database) |

## Project Structure

```
Scholario/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # Data model
│   │   ├── migrations/
│   │   ├── create-admin.js          # One-off script to seed the first admin account
│   │   └── verify-existing-users.js # One-off backfill after the verification migration
│   ├── src/
│   │   ├── config/db.js             # Shared Prisma client
│   │   ├── controllers/             # auth, admin, assignment, submission
│   │   ├── middleware/              # auth, role, error handling
│   │   ├── utils/                   # AppError, jwt, validate, email
│   │   ├── routes/
│   │   └── app.js
│   └── server.js
├── frontend/
│   ├── app/                         # Pages (App Router)
│   │   ├── login/, register/, dashboard/
│   │   ├── verify-email/, forgot-password/, reset-password/
│   │   ├── assignments/, assignments/new/, assignments/[id]/
│   │   └── admin/                   # classes, subjects, teachers, students
│   ├── components/                  # Navbar, StampBadge, PasswordInput, etc.
│   └── lib/                         # api.js, AuthContext, ToastContext
└── README.md
```

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (LTS)
- [PostgreSQL](https://www.postgresql.org/download/) installed locally, **or** a free [Neon](https://neon.tech) connection string
- A Google Cloud project with the Gmail API enabled and OAuth2 credentials (see below) — used to send verification/reset emails from your own Gmail account
- Git

### 1. Clone the repository
```bash
git clone https://github.com/foyez101/Scholario.git
cd Scholario
```

### 2. Set up Gmail API credentials (one-time)
1. Create a project at [console.cloud.google.com](https://console.cloud.google.com) and enable the **Gmail API**.
2. Configure the OAuth consent screen (External, keep it in **Testing** mode, add your own Gmail as a test user).
3. Create an **OAuth Client ID** (Web application), with `https://developers.google.com/oauthplayground` as an authorized redirect URI.
4. Use [Google's OAuth Playground](https://developers.google.com/oauthplayground) with your own client ID/secret to authorize the `https://www.googleapis.com/auth/gmail.send` scope and obtain a refresh token.

This runs entirely over HTTPS, so it isn't affected by hosts that block outbound SMTP ports (see [Challenges & Solutions](#challenges--solutions)).

### 3. Backend setup
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
GMAIL_USER=youraddress@gmail.com
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

### 4. Database setup
```bash
npx prisma migrate dev
node prisma/create-admin.js
```
The first command creates all tables. The second creates one admin account
(`admin@scholario.com` / `admin123`) — admins can't self-register through the app,
by design (see [Assumptions](#assumptions)).

> If you're applying the migrations to a database that already has accounts in it
> (e.g. upgrading an existing setup), also run `node prisma/verify-existing-users.js`
> once, so those accounts aren't locked out by the new email-verification requirement.

### 5. Run the backend
```bash
npm run dev
```
API available at `http://localhost:5000/api`.

### 6. Frontend setup
```bash
cd ../frontend
npm install
cp .env.local.example .env.local
```
`frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 7. Run the frontend
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
Register a new account at `/register` with any real email address, verify it with the
code sent to that inbox, then log in as Admin to assign the teacher to a subject/class,
or enroll the student into a class.

## Running Tests

Automated tests are not implemented yet — see [Known Limitations](#known-limitations).

## API Overview

All routes are prefixed with `/api`.

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register as Student or Teacher |
| POST | `/auth/verify-email` | Public | Confirm the emailed code, activates the account and logs in |
| POST | `/auth/resend-verification` | Public | Send a new verification code |
| POST | `/auth/login` | Public | Log in, returns a JWT (blocked until verified) |
| POST | `/auth/forgot-password` | Public | Send a password reset code |
| POST | `/auth/reset-password` | Public | Set a new password using the emailed code |
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
- New accounts must verify their email before logging in; this trades off a small amount of
  registration friction for confidence that the email on file is real and reachable.

## Known Limitations

- No automated test suite yet (Jest + Supertest planned)
- No Swagger/OpenAPI documentation page yet
- No seed script for demo Teacher/Student accounts — only the Admin account is seeded;
  other roles must be created manually via registration
- Free-tier hosting trade-offs: the Render backend spins down after ~15 minutes of
  inactivity (cold start delay on the next request), and the Neon database scales to
  zero when idle (a brief delay on the first query after inactivity)
- Email is sent through a single personal Gmail account via OAuth2 in Google's
  "Testing" publishing mode - appropriate for a project at this scale, but a production
  system serving real users would use a dedicated transactional email service instead

## Challenges & Solutions

A few real problems came up during development, and how they were diagnosed and fixed:

**Mutation responses silently missing related data**
*Problem:* After publishing an assignment or grading a submission, the record Prisma
returned didn't include the related subject/class/teacher/student data the frontend
expected, so the page crashed trying to read fields off `undefined`.
*Fix:* Added explicit `include` clauses to those `update()` calls so mutation responses
carry the same shape as the initial fetch that populates the page.

**Raw database errors reaching the UI**
*Problem:* Attempting to assign a teacher who was already assigned to that subject/class
threw Prisma's raw internal error (including file paths and code context) straight through
to the screen.
*Fix:* Added explicit duplicate checks for the most common cases, plus a central
error-handling layer that translates remaining Prisma error codes into plain,
user-facing messages.

**A new required field locking out existing accounts**
*Problem:* Adding email verification introduced an `isVerified` field defaulting to
`false`. Migrating straight in would have silently locked out every account that already
existed, including the seeded admin.
*Fix:* Wrote a one-time backfill script that marks all pre-existing accounts as verified,
run immediately after applying the migration in each environment.

**Live backend crashing after adding a new environment-dependent feature**
*Problem:* After deploying the email-verification feature, the live backend crashed on
startup with `Missing API key`, since a new environment variable existed in the local
`.env` file but hadn't been added to the hosting platform yet.
*Fix:* Added the missing variable in the hosting dashboard - and a reminder to add new
environment variables to every environment a feature touches, not just the local one.

**A stale Prisma Client on the live server after a schema change**
*Problem:* After adding new database fields, registration worked locally but failed on
the live deployment with a vague "submitted data was invalid" error - the live server was
still running a Prisma Client generated before the schema change.
*Fix:* Added a `postinstall` script (`prisma generate`) to `package.json`, so the Prisma
Client is always freshly regenerated on every deploy, not just when the schema happens to
change during that particular build.

**Finding a genuinely free way to email any real user**
*Problem:* This took several iterations. The first provider (Resend) worked, but its
free tier without a verified custom domain only delivers to the email address the
account itself is registered with - unusable for real registrations from other people.
Switching to sending directly through Gmail's SMTP server hit a different wall: Render's
free tier blocks all outbound SMTP ports (25, 465, 587) as an anti-abuse measure, so
every send timed out in production despite working perfectly locally. A third attempt
with another transactional email provider stalled on an account phone-verification step.
*Fix:* Switched to sending through the **Gmail API directly** (not SMTP) using OAuth2 -
this travels over ordinary HTTPS, so it isn't affected by the SMTP port block, it sends
from a real Gmail account so there's no recipient restriction, and Google allows this for
personal projects in "Testing" publishing mode with no app review needed.

**Free-tier cold starts looking like a broken login**
*Problem:* The backend's free hosting tier spins down after inactivity; the next request
can take 30–60 seconds, which risked looking like the login page was simply stuck.
*Fix:* Added a request timeout, and a "still connecting, the server may be waking up"
hint that appears if a request takes more than a few seconds, so the delay is explained
instead of silent.

**Early commit history not reading professionally**
*Problem:* The first two commits used casual "Day 1"/"Day 2" style messages.
*Fix:* Used an interactive rebase (`git rebase -i --root`) to reword them to plain,
descriptive messages, then force-pushed once, early on, while the repository was still
solo with no collaborators to disrupt.

## Author

**Foyez** ([@foyez101](https://github.com/foyez101))
