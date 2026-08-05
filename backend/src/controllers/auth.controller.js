const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const { generateToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    // Business rule: only STUDENT or TEACHER accounts can self-register.
    // ADMIN accounts are never created through a public endpoint - they're
    // seeded directly into the database (see prisma/seed.js, added later).
    if (!['STUDENT', 'TEACHER'].includes(role)) {
      throw new AppError('Only STUDENT or TEACHER accounts can self-register', 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
    });

    const token = generateToken({ id: user.id, role: user.role });

    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      throw new AppError('User no longer exists', 404);
    }

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };
