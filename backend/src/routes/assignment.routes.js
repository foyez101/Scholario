const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  createAssignment,
  listAssignments,
  getTeachingOptions,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  togglePublish,
} = require('../controllers/assignment.controller');

const verifyToken = require('../middleware/auth.middleware');
const restrictTo = require('../middleware/role.middleware');
const runValidation = require('../utils/validate');

const createRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('subjectId').notEmpty().withMessage('subjectId is required'),
  body('classId').notEmpty().withMessage('classId is required'),
  body('deadline').isISO8601().withMessage('deadline must be a valid date (e.g. 2026-08-20)'),
  body('maxMarks').isInt({ min: 1 }).withMessage('maxMarks must be a positive number'),
];

// Every route needs a logged-in user; specific role checks happen per route.
router.use(verifyToken);

router.post('/', restrictTo('TEACHER'), createRules, runValidation, createAssignment);
router.get('/', listAssignments); // teacher/student/admin all allowed - filtered inside the controller
router.get('/teaching-options', restrictTo('TEACHER'), getTeachingOptions);
router.get('/:id', getAssignment);
router.patch('/:id', restrictTo('TEACHER'), updateAssignment);
router.delete('/:id', restrictTo('TEACHER'), deleteAssignment);
router.patch('/:id/publish', restrictTo('TEACHER'), togglePublish);

module.exports = router;
