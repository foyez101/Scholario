const prisma = require('../config/db');
const AppError = require('../utils/AppError');

// Student submits an answer to a published assignment they're enrolled in,
// before its deadline.
async function createSubmission(req, res, next) {
  try {
    const { assignmentId, content } = req.body;
    const studentId = req.user.id;

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new AppError('Assignment not found', 404);

    if (assignment.status !== 'PUBLISHED') {
      throw new AppError('This assignment is not open for submissions', 400);
    }

    const enrolled = await prisma.enrollment.findFirst({
      where: { studentId, classId: assignment.classId },
    });
    if (!enrolled) {
      throw new AppError("You are not enrolled in this assignment's class", 403);
    }

    if (new Date() > assignment.deadline) {
      throw new AppError('The deadline for this assignment has passed', 400);
    }

    const existing = await prisma.submission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } },
    });
    if (existing) {
      throw new AppError('You already submitted this assignment - use update instead', 409);
    }

    const submission = await prisma.submission.create({
      data: { assignmentId, studentId, content, status: 'SUBMITTED' },
    });

    res.status(201).json({ success: true, submission });
  } catch (err) {
    next(err);
  }
}

// Role-aware listing:
// - STUDENT sees their own submissions
// - TEACHER sees submissions for assignments they created
// - ADMIN sees everything
// Optional ?assignmentId= filters to one assignment (teachers can only use
// this for their own assignments).
async function listSubmissions(req, res, next) {
  try {
    const { role, id } = req.user;
    const { assignmentId } = req.query;
    let where = {};

    if (role === 'STUDENT') {
      where = { studentId: id };
      if (assignmentId) where.assignmentId = assignmentId;
    } else if (role === 'TEACHER') {
      const myAssignments = await prisma.assignment.findMany({
        where: { teacherId: id },
        select: { id: true },
      });
      const myAssignmentIds = myAssignments.map((a) => a.id);

      if (assignmentId) {
        if (!myAssignmentIds.includes(assignmentId)) {
          throw new AppError("You do not have access to this assignment's submissions", 403);
        }
        where = { assignmentId };
      } else {
        where = { assignmentId: { in: myAssignmentIds } };
      }
    } else if (assignmentId) {
      // ADMIN with an optional filter
      where = { assignmentId };
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        assignment: { select: { id: true, title: true, maxMarks: true, deadline: true } },
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    res.json({ success: true, submissions });
  } catch (err) {
    next(err);
  }
}

async function getSubmission(req, res, next) {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        assignment: true,
        student: { select: { id: true, name: true, email: true } },
      },
    });

    if (!submission) throw new AppError('Submission not found', 404);

    if (role === 'STUDENT' && submission.studentId !== userId) {
      throw new AppError('You do not have access to this submission', 403);
    }
    if (role === 'TEACHER' && submission.assignment.teacherId !== userId) {
      throw new AppError('You do not have access to this submission', 403);
    }

    res.json({ success: true, submission });
  } catch (err) {
    next(err);
  }
}

// Student updates their own submission, only before the deadline.
// If it had already been graded, editing it clears the old grade and
// flags it as RESUBMITTED, since the graded content no longer matches.
async function updateSubmission(req, res, next) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const studentId = req.user.id;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { assignment: true },
    });

    if (!submission) throw new AppError('Submission not found', 404);
    if (submission.studentId !== studentId) {
      throw new AppError('You can only update your own submission', 403);
    }
    if (new Date() > submission.assignment.deadline) {
      throw new AppError('The deadline has passed - you can no longer update this submission', 400);
    }

    const wasGraded = submission.status === 'GRADED';

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        content,
        status: wasGraded ? 'RESUBMITTED' : submission.status,
        ...(wasGraded && { marks: null, feedback: null }),
      },
    });

    res.json({ success: true, submission: updated });
  } catch (err) {
    next(err);
  }
}

// Teacher grades a submission - only for their own assignment, and only
// within the assignment's max marks.
async function gradeSubmission(req, res, next) {
  try {
    const { id } = req.params;
    const { marks, feedback } = req.body;
    const teacherId = req.user.id;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { assignment: true },
    });

    if (!submission) throw new AppError('Submission not found', 404);
    if (submission.assignment.teacherId !== teacherId) {
      throw new AppError('You can only grade submissions for your own assignments', 403);
    }
    if (marks > submission.assignment.maxMarks) {
      throw new AppError(`Marks cannot exceed the maximum of ${submission.assignment.maxMarks}`, 400);
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: { marks, feedback, status: 'GRADED' },
    });

    res.json({ success: true, submission: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createSubmission,
  listSubmissions,
  getSubmission,
  updateSubmission,
  gradeSubmission,
};
