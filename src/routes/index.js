const express = require('express');
const router = express.Router();

// Simple health check - confirms the API is up and reachable.
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Scholario API is running' });
});

router.use('/auth', require('./auth.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/assignments', require('./assignment.routes'));
router.use('/submissions', require('./submission.routes'));

module.exports = router;
