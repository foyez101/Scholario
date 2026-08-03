const { PrismaClient } = require('@prisma/client');

// A single shared Prisma instance for the whole app.
// Prevents exhausting the DB connection pool from creating
// multiple clients (especially painful with nodemon reloads).
const prisma = new PrismaClient();

module.exports = prisma;
