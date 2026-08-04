// Creates the very first Admin account directly in the database.
// Admins can't register through the API (see auth.controller.js), so this
// script is the only way to create one. Run it once with:
//   node prisma/create-admin.js
//
// This will later be folded into a full seed script (Day 5) that also
// creates demo Teacher and Student accounts.

require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@scholario.com';
  const password = 'admin123';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('An admin with this email already exists:', email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name: 'Admin', email, passwordHash, role: 'ADMIN' },
  });

  console.log('Admin account created:');
  console.log('  email:   ', email);
  console.log('  password:', password);
}

main()
  .catch((err) => console.error(err))
  .finally(() => prisma.$disconnect());
