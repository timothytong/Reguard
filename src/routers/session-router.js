import { Router } from 'express';
import { getSessionIfActive, createActiveSession } from '../dao/session-dao';

const router = Router();

function getActiveSession(req, res) {
  // const { userId, deviceId } = req.body;

  const onSuccess = (activeSession) => res.status(200).json({ activeSession });

  const onError = (err) => res.status(500).json({
    message: 'Unexpected error occurred while retrieving active session.',
    error: err,
  });

  // TODO: `${userId}#${deviceId}`
  const sessionId = 'user#uuid1';

  getSessionIfActive(sessionId)
    .then((activeSession) => onSuccess(activeSession))
    .catch((err) => onError(err));
}

function startSession(req, res) {
  // const { userId, deviceId } = req.body;
  const { userId } = req.body;

  const onError = (err) => res.status(500).json({
    message: 'Error occurred while starting session.',
    error: err,
  });

  // TODO: `${userId}#${deviceId}`
  const sessionId = 'user#uuid2';

  getSessionIfActive(sessionId)
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

router.get('/active', getActiveSession);
router.post('/start', startSession);

module.exports = router;
