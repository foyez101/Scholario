// One-time fix: the email-verification feature is new, so every account
// created before it existed would otherwise be incorrectly marked as
// unverified and locked out. Run this once, right after applying the
// migration that adds the isVerified field:
//   node prisma/verify-existing-users.js

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: { isVerified: false },
    data: { isVerified: true },
  });

  console.log(`Marked ${result.count} existing account(s) as verified.`);
}

main()
  .catch((err) => console.error(err))
  .finally(() => prisma.$disconnect());
