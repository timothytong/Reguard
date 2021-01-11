import { Router } from 'express';
import {
  setEndTime,
  getSessionIfActive,
  createActiveSession,
} from '../dao/session-dao';

const router = Router();

function getActiveSession(req, res) {
  // const { userId, deviceId } = req.body;

  const onSuccess = (activeSession) => res.status(200).json({ activeSession });

  const onError = (err) => res.status(500).json({
    message: 'Unexpected error occurred while retrieving active session.',
    error: err.message,
  });

  // TODO: `${userId}#${deviceId}`
  const sessionId = 'user#uuid2';

  return getSessionIfActive(sessionId)
    .then((activeSession) => onSuccess(activeSession))
    .catch((err) => onError(err));
}

function startSession(req, res) {
  // const { userId, deviceId } = req.body;
  const { userId } = req.body;

  const onError = (err) => res.status(500).json({
    message: 'Error occurred while starting session.',
    error: err.message,
  });

  // TODO: `${userId}#${deviceId}`
  const sessionId = 'user#uuid2';

  return getSessionIfActive(sessionId)
    .then((activeSession) => {
      if (!activeSession) {
        return createActiveSession(sessionId)
          .then(() => res.sendStatus(200))
          .catch((err) => {
            onError(err);
          });
      }
      console.log(`User ${userId} already has an active session!`);
      return res.sendStatus(202);
    });
}

function endSession(req, res) {
  const onError = (err) => res.status(500).json({
    message: 'Error occurred while ending session.',
    error: err.message,
  });
  const sessionId = 'user#uuid1';

  return getSessionIfActive(sessionId)
    .then((activeSession) => {
      if (!activeSession) {
        return onError(new Error('User has no active session'));
      }
      const startTime = activeSession.start_time;
      const endTime = Date.now().toString();
      return setEndTime(sessionId, startTime, endTime)
        .then(() => res.sendStatus(200))
        .catch((err) => onError(err));
    });
}

router.get('/active', getActiveSession);
router.post('/start', startSession);
router.post('/end', endSession);

module.exports = router;
