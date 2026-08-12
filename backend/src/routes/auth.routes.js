const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  register,
  verifyEmail,
  resendVerification,
  login,
  forgotPassword,
  resetPassword,
  getMe,
} = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth.middleware');
const runValidation = require('../utils/validate');

// Requires at least 8 characters, one uppercase, one lowercase, one number,
// and one special character.
const strongPassword = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/[a-z]/)
  .withMessage('Password must include a lowercase letter')
  .matches(/[A-Z]/)
  .withMessage('Password must include an uppercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must include a number')
  .matches(/[^A-Za-z0-9]/)
  .withMessage('Password must include a special character');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  strongPassword,
  body('role').isIn(['STUDENT', 'TEACHER']).withMessage('Role must be STUDENT or TEACHER'),
];

const verifyRules = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('code').trim().notEmpty().withMessage('Code is required'),
];

const resendRules = [body('email').isEmail().withMessage('A valid email is required')];

const loginRules = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotRules = [body('email').isEmail().withMessage('A valid email is required')];

const resetRules = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('code').trim().notEmpty().withMessage('Code is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/)
    .withMessage('Password must include a lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must include an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must include a number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must include a special character'),
];

router.post('/register', registerRules, runValidation, register);
router.post('/verify-email', verifyRules, runValidation, verifyEmail);
router.post('/resend-verification', resendRules, runValidation, resendVerification);
router.post('/login', loginRules, runValidation, login);
router.post('/forgot-password', forgotRules, runValidation, forgotPassword);
router.post('/reset-password', resetRules, runValidation, resetPassword);
router.get('/me', verifyToken, getMe);

module.exports = router;
