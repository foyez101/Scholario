const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { register, login, getMe } = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth.middleware');
const restrictTo = require('../middleware/role.middleware');
const runValidation = require('../utils/validate');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['STUDENT', 'TEACHER']).withMessage('Role must be STUDENT or TEACHER'),
];

const loginRules = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerRules, runValidation, register);
router.post('/login', loginRules, runValidation, login);
router.get('/me', verifyToken, getMe);

// Demonstrates role-restricted access - real admin routes get built in later days.
router.get('/admin-only', verifyToken, restrictTo('ADMIN'), (req, res) => {
  res.json({ success: true, message: 'Welcome, admin.' });
});

module.exports = router;
