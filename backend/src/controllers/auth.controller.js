const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const { generateToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const { generateCode, sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

const SALT_ROUNDS = 10;
const CODE_LIFETIME_MS = 15 * 60 * 1000; // 15 minutes

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    // Business rule: only STUDENT or TEACHER accounts can self-register.
    // ADMIN accounts are never created through a public endpoint - they're
    // seeded directly into the database (see prisma/create-admin.js).
    if (!['STUDENT', 'TEACHER'].includes(role)) {
      throw new AppError('Only STUDENT or TEACHER accounts can self-register', 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const verificationCode = generateCode();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        isVerified: false,
        verificationCode,
        verificationCodeExpiry: new Date(Date.now() + CODE_LIFETIME_MS),
      },
    });

    try {
      await sendVerificationEmail(user.email, user.name, verificationCode);
    } catch (emailErr) {
      // The account is still created even if the email fails to send -
      // the person can request a fresh code via /auth/resend-verification.
      console.error('Failed to send verification email:', emailErr.message);
    }

    // No token yet - the account isn't usable until it's verified.
    res.status(201).json({
      success: true,
      message: 'Account created. Check your email for a verification code.',
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { email, code } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('No account found with this email', 404);
    }
    if (user.isVerified) {
      throw new AppError('This account is already verified', 400);
    }
    if (!user.verificationCode || user.verificationCode !== code) {
      throw new AppError('That code is incorrect', 400);
    }
    if (!user.verificationCodeExpiry || new Date() > user.verificationCodeExpiry) {
      throw new AppError('That code has expired - request a new one', 400);
    }

    const verified = await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationCode: null, verificationCodeExpiry: null },
    });

    const token = generateToken({ id: verified.id, role: verified.role });

    res.json({
      success: true,
      token,
      user: { id: verified.id, name: verified.name, email: verified.email, role: verified.role },
    });
  } catch (err) {
    next(err);
  }
}

async function resendVerification(req, res, next) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    // Deliberately vague if the account doesn't exist, so this endpoint
    // can't be used to check which emails are registered.
    if (!user || user.isVerified) {
      return res.json({ success: true, message: 'If that account exists and needs verifying, a new code was sent.' });
    }

    const verificationCode = generateCode();
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode, verificationCodeExpiry: new Date(Date.now() + CODE_LIFETIME_MS) },
    });

    await sendVerificationEmail(user.email, user.name, verificationCode);

    res.json({ success: true, message: 'If that account exists and needs verifying, a new code was sent.' });
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

    if (!user.isVerified) {
      throw new AppError('Please verify your email before logging in', 403);
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

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    // Same deliberately-vague response whether or not the account exists.
    if (!user) {
      return res.json({ success: true, message: 'If that account exists, a reset code was sent.' });
    }

    const resetPasswordCode = generateCode();
    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordCode, resetPasswordExpiry: new Date(Date.now() + CODE_LIFETIME_MS) },
    });

    await sendPasswordResetEmail(user.email, user.name, resetPasswordCode);

    res.json({ success: true, message: 'If that account exists, a reset code was sent.' });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.resetPasswordCode || user.resetPasswordCode !== code) {
      throw new AppError('That code is incorrect', 400);
    }
    if (!user.resetPasswordExpiry || new Date() > user.resetPasswordExpiry) {
      throw new AppError('That code has expired - request a new one', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetPasswordCode: null, resetPasswordExpiry: null },
    });

    res.json({ success: true, message: 'Password updated. You can now log in.' });
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

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  forgotPassword,
  resetPassword,
  getMe,
};
