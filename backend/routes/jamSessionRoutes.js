const express = require('express');
const {
  createSession,
  joinSession,
  getSession,
  syncSession,
  leaveSession,
} = require('../controllers/jamSessionController');

const router = express.Router();

router.post('/', createSession);
router.post('/:code/join', joinSession);
router.get('/:code', getSession);
router.post('/:code/sync', syncSession);
router.post('/:code/leave', leaveSession);

module.exports = router;
