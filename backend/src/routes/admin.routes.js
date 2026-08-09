const express = require('express');
const router = express.Router();

const {
  listUsers,
  createClass,
  listClasses,
  updateClass,
  deleteClass,
  createSubject,
  listSubjects,
  updateSubject,
  deleteSubject,
  assignTeacher,
  listTeacherAssignments,
  removeTeacherAssignment,
  enrollStudent,
  listEnrollments,
  removeEnrollment,
} = require('../controllers/admin.controller');

const verifyToken = require('../middleware/auth.middleware');
const restrictTo = require('../middleware/role.middleware');

// Every route below this line requires a logged-in ADMIN.
router.use(verifyToken, restrictTo('ADMIN'));

router.get('/users', listUsers);

router.post('/classes', createClass);
router.get('/classes', listClasses);
router.patch('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);

router.post('/subjects', createSubject);
router.get('/subjects', listSubjects);
router.patch('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

router.post('/teacher-assignments', assignTeacher);
router.get('/teacher-assignments', listTeacherAssignments);
router.delete('/teacher-assignments/:id', removeTeacherAssignment);

router.post('/enrollments', enrollStudent);
router.get('/enrollments', listEnrollments);
router.delete('/enrollments/:id', removeEnrollment);

module.exports = router;
