const express = require('express');
const router = express.Router();

// Simple health check - confirms the API is up and reachable.
// Useful for verifying your deployment on Render later too.
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Scholario API is running' });
});

// Day 2 onward: mount feature routers here, e.g.
// router.use('/auth', require('./auth.routes'));
// router.use('/classes', require('./class.routes'));
// router.use('/assignments', require('./assignment.routes'));
// router.use('/submissions', require('./submission.routes'));

module.exports = router;
