const prisma = require('../config/db');
const AppError = require('../utils/AppError');

// ----- Users -----

// Lists users, optionally filtered by role (e.g. ?role=TEACHER).
// Used to populate the teacher/student dropdowns on the admin screens.
async function listUsers(req, res, next) {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};
    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
}

// ----- Classes -----

async function createClass(req, res, next) {
  try {
    const { name } = req.body;
    const cls = await prisma.class.create({ data: { name } });
    res.status(201).json({ success: true, class: cls });
  } catch (err) {
    next(err);
  }
}

async function listClasses(req, res, next) {
  try {
    const classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, classes });
  } catch (err) {
    next(err);
  }
}

async function updateClass(req, res, next) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const cls = await prisma.class.update({ where: { id }, data: { name } });
    res.json({ success: true, class: cls });
  } catch (err) {
    next(err);
  }
}

async function deleteClass(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.class.delete({ where: { id } });
    res.json({ success: true, message: 'Class deleted' });
  } catch (err) {
    next(err);
  }
}

// ----- Subjects -----

async function createSubject(req, res, next) {
  try {
    const { name } = req.body;
    const subject = await prisma.subject.create({ data: { name } });
    res.status(201).json({ success: true, subject });
  } catch (err) {
    next(err);
  }
}

async function listSubjects(req, res, next) {
  try {
    const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, subjects });
  } catch (err) {
    next(err);
  }
}

async function updateSubject(req, res, next) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const subject = await prisma.subject.update({ where: { id }, data: { name } });
    res.json({ success: true, subject });
  } catch (err) {
    next(err);
  }
}

async function deleteSubject(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.subject.delete({ where: { id } });
    res.json({ success: true, message: 'Subject deleted' });
  } catch (err) {
    next(err);
  }
}

// ----- Teacher assignments (who teaches what, in which class) -----

async function assignTeacher(req, res, next) {
  try {
    const { teacherId, subjectId, classId } = req.body;

    const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
    if (!teacher || teacher.role !== 'TEACHER') {
      throw new AppError('teacherId must belong to a user with role TEACHER', 400);
    }

    const existing = await prisma.teacherAssignment.findFirst({
      where: { teacherId, subjectId, classId },
    });
    if (existing) {
      throw new AppError('This teacher is already assigned to that subject and class.', 409);
    }

    const assignment = await prisma.teacherAssignment.create({
      data: { teacherId, subjectId, classId },
    });
    res.status(201).json({ success: true, teacherAssignment: assignment });
  } catch (err) {
    next(err);
  }
}

async function listTeacherAssignments(req, res, next) {
  try {
    const assignments = await prisma.teacherAssignment.findMany({
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        subject: true,
        class: true,
      },
    });
    res.json({ success: true, teacherAssignments: assignments });
  } catch (err) {
    next(err);
  }
}

async function removeTeacherAssignment(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.teacherAssignment.delete({ where: { id } });
    res.json({ success: true, message: 'Teacher assignment removed' });
  } catch (err) {
    next(err);
  }
}

// ----- Enrollments (which student belongs to which class) -----

async function enrollStudent(req, res, next) {
  try {
    const { studentId, classId } = req.body;

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== 'STUDENT') {
      throw new AppError('studentId must belong to a user with role STUDENT', 400);
    }

    const existing = await prisma.enrollment.findFirst({ where: { studentId, classId } });
    if (existing) {
      throw new AppError('This student is already enrolled in that class.', 409);
    }

    const enrollment = await prisma.enrollment.create({ data: { studentId, classId } });
    res.status(201).json({ success: true, enrollment });
  } catch (err) {
    next(err);
  }
}

async function listEnrollments(req, res, next) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        student: { select: { id: true, name: true, email: true } },
        class: true,
      },
    });
    res.json({ success: true, enrollments });
  } catch (err) {
    next(err);
  }
}

async function removeEnrollment(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.enrollment.delete({ where: { id } });
    res.json({ success: true, message: 'Enrollment removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
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
};
