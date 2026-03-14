const jamSessionService = require('../services/jamSessionService');

const handleError = (res, error) => {
  res.status(error.status || 500).json({ message: error.message || 'Jam session error.' });
};

const createSession = (req, res) => {
  try {
    const result = jamSessionService.createSession(req.body);
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const joinSession = (req, res) => {
  try {
    const result = jamSessionService.joinSession(req.params.code, req.body);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

const getSession = (req, res) => {
  try {
    const session = jamSessionService.getSession(req.params.code, req.query.memberId);
    res.json({ session });
  } catch (error) {
    handleError(res, error);
  }
};

const syncSession = (req, res) => {
  try {
    const session = jamSessionService.syncSessionPlayback(req.params.code, req.body);
    res.json({ session });
  } catch (error) {
    handleError(res, error);
  }
};

const leaveSession = (req, res) => {
  try {
    jamSessionService.leaveSession(req.params.code, req.body.memberId);
    res.status(204).end();
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createSession,
  joinSession,
  getSession,
  syncSession,
  leaveSession,
};
