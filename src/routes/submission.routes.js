const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  createSubmission,
  listSubmissions,
  getSubmission,
  updateSubmission,
  gradeSubmission,
} = require('../controllers/submission.controller');

const verifyToken = require('../middleware/auth.middleware');
const restrictTo = require('../middleware/role.middleware');
const runValidation = require('../utils/validate');

const createRules = [
  body('assignmentId').notEmpty().withMessage('assignmentId is required'),
  body('content').trim().notEmpty().withMessage('content is required'),
];

const updateRules = [body('content').trim().notEmpty().withMessage('content is required')];

const gradeRules = [
  body('marks').isInt({ min: 0 }).withMessage('marks must be a non-negative number'),
  body('feedback').optional().trim(),
];

router.use(verifyToken);

router.post('/', restrictTo('STUDENT'), createRules, runValidation, createSubmission);
router.get('/', listSubmissions); // role-aware, filtered inside the controller
router.get('/:id', getSubmission);
router.patch('/:id', restrictTo('STUDENT'), updateRules, runValidation, updateSubmission);
router.patch('/:id/grade', restrictTo('TEACHER'), gradeRules, runValidation, gradeSubmission);

module.exports = router;
