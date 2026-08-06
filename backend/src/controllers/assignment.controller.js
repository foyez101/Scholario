const prisma = require('../config/db');
const AppError = require('../utils/AppError');

// Teacher creates an assignment - but only for a subject/class they're
// actually assigned to teach (checked against TeacherAssignment).
async function createAssignment(req, res, next) {
  try {
    const { title, description, subjectId, classId, deadline, maxMarks } = req.body;
    const teacherId = req.user.id;

    const isAssigned = await prisma.teacherAssignment.findFirst({
      where: { teacherId, subjectId, classId },
    });
    if (!isAssigned) {
      throw new AppError('You are not assigned to teach this subject in this class', 403);
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        subjectId,
        classId,
        teacherId,
        deadline: new Date(deadline),
        maxMarks,
        status: 'DRAFT',
      },
    });

    res.status(201).json({ success: true, assignment });
  } catch (err) {
    next(err);
  }
}

// Role-aware listing:
// - TEACHER sees assignments they created (draft + published)
// - STUDENT sees only PUBLISHED assignments for classes they're enrolled in
// - ADMIN sees everything
async function listAssignments(req, res, next) {
  try {
    const { role, id } = req.user;
    let where = {};

    if (role === 'TEACHER') {
      where = { teacherId: id };
    } else if (role === 'STUDENT') {
      const enrollments = await prisma.enrollment.findMany({ where: { studentId: id } });
      const classIds = enrollments.map((e) => e.classId);
      where = { classId: { in: classIds }, status: 'PUBLISHED' };
    }
    // ADMIN: no filter, sees everything.

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        subject: true,
        class: true,
        teacher: { select: { id: true, name: true } },
      },
      orderBy: { deadline: 'asc' },
    });

    res.json({ success: true, assignments });
  } catch (err) {
    next(err);
  }
}

// Returns the subject/class combinations this teacher is actually assigned
// to teach - used to populate the "create assignment" form on the frontend.
async function getTeachingOptions(req, res, next) {
  try {
    const teacherId = req.user.id;
    const options = await prisma.teacherAssignment.findMany({
      where: { teacherId },
      include: { subject: true, class: true },
    });
    res.json({ success: true, options });
  } catch (err) {
    next(err);
  }
}

async function getAssignment(req, res, next) {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        subject: true,
        class: true,
        teacher: { select: { id: true, name: true } },
      },
    });

    if (!assignment) throw new AppError('Assignment not found', 404);

    if (role === 'TEACHER' && assignment.teacherId !== userId) {
      throw new AppError('You do not have access to this assignment', 403);
    }

    if (role === 'STUDENT') {
      if (assignment.status !== 'PUBLISHED') {
        throw new AppError('This assignment is not available', 404);
      }
      const enrolled = await prisma.enrollment.findFirst({
        where: { studentId: userId, classId: assignment.classId },
      });
      if (!enrolled) throw new AppError('You do not have access to this assignment', 403);
    }

    res.json({ success: true, assignment });
  } catch (err) {
    next(err);
  }
}

// Only the teacher who created an assignment can edit it.
async function updateAssignment(req, res, next) {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const existing = await prisma.assignment.findUnique({ where: { id } });
    if (!existing) throw new AppError('Assignment not found', 404);
    if (existing.teacherId !== teacherId) {
      throw new AppError('You can only edit your own assignments', 403);
    }

    const { title, description, deadline, maxMarks } = req.body;
    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(maxMarks !== undefined && { maxMarks }),
      },
    });

    res.json({ success: true, assignment });
  } catch (err) {
    next(err);
  }
}

async function deleteAssignment(req, res, next) {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const existing = await prisma.assignment.findUnique({ where: { id } });
    if (!existing) throw new AppError('Assignment not found', 404);
    if (existing.teacherId !== teacherId) {
      throw new AppError('You can only delete your own assignments', 403);
    }

    await prisma.assignment.delete({ where: { id } });
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (err) {
    next(err);
  }
}

// Toggles an assignment between DRAFT and PUBLISHED.
async function togglePublish(req, res, next) {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const existing = await prisma.assignment.findUnique({ where: { id } });
    if (!existing) throw new AppError('Assignment not found', 404);
    if (existing.teacherId !== teacherId) {
      throw new AppError('You can only publish your own assignments', 403);
    }

    const newStatus = existing.status === 'DRAFT' ? 'PUBLISHED' : 'DRAFT';
    const assignment = await prisma.assignment.update({
      where: { id },
      data: { status: newStatus },
      include: {
        subject: true,
        class: true,
        teacher: { select: { id: true, name: true } },
      },
    });

    res.json({ success: true, assignment });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAssignment,
  listAssignments,
  getTeachingOptions,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  togglePublish,
};
