# Scholario — Assignment & Submission Management System

A role-based web application for schools/colleges where teachers create and grade
assignments, and students submit work and track feedback.

> Status: Day 1 — project scaffold, database schema, and health check endpoint.
> This README will be filled in further as the project grows over the next few days.

## Tech stack

- **Frontend:** Next.js (JavaScript)
- **Backend:** Express (JavaScript)
- **Database:** PostgreSQL, via Prisma ORM
- **Auth:** JWT (jsonwebtoken + bcrypt), role-based middleware
- **Testing:** Jest + Supertest
- **Hosting:** Vercel (frontend), Render (backend), Neon (database)

## Project structure

```
scholario-backend/
  prisma/
    schema.prisma       # Data model
  src/
    config/db.js        # Prisma client singleton
    routes/              # API route definitions
    controllers/          # Route handler logic (added Day 2+)
    middleware/            # Auth, role guards, error handling
    utils/
    app.js               # Express app setup
  server.js               # Entry point
  .env.example
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```
For local development, point `DATABASE_URL` at your local PostgreSQL database
(see the local setup instructions below).

### 3. Set up the database
```bash
npx prisma migrate dev --name init
npx prisma generate
```
This creates all tables from `prisma/schema.prisma` in your database.

### 4. Run the dev server
```bash
npm run dev
```
API will be available at `http://localhost:5000/api/health`.

## Local PostgreSQL setup

1. Install PostgreSQL locally.
2. Create a database:
   ```sql
   CREATE DATABASE scholario;
   ```
3. Set `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/scholario"
   ```

## Data model

- **User** — id, name, email, passwordHash, role (ADMIN / TEACHER / STUDENT)
- **Class** — a class/course
- **Subject** — a subject taught within classes
- **TeacherAssignment** — which teacher teaches which subject in which class
- **Enrollment** — which student belongs to which class
- **Assignment** — title, description, deadline, maxMarks, status (DRAFT / PUBLISHED)
- **Submission** — a student's submitted work, status, marks, feedback

## Assumptions

- Using Express + Prisma instead of ASP.NET Core, per the brief's "or equivalent
  technologies suitable for the project" allowance. Documented here as required.
- Using PostgreSQL (Prisma) instead of MongoDB, for its relational fit with this
  domain (users, classes, assignments, and submissions all reference each other).

## Known limitations (Day 1)

- Auth, CRUD endpoints, and the frontend are not built yet — coming over the next
  few days. Only a health check endpoint exists so far.
