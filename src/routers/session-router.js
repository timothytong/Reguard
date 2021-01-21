import { Router } from 'express';
import { refreshLastPingedTs } from '../dao/device-dao';
import {
  setEndTime,
  getSessionIfActive,
  batchCreateActiveSessions,
} from '../dao/session-dao';

const router = Router();

async function getActiveSession(req, res) {
  const { userId, deviceId } = req.query;
  const sessionId = `${userId}#${deviceId}`;
  const onSuccess = (activeSession) => res.status(200).json({ activeSession });
  const onError = (err) => res.status(500).json({
    message: 'Unexpected error occurred while retrieving active session.',
    error: err.message,
  });

  return refreshLastPingedTs(userId, deviceId)
    .then(() => getSessionIfActive(sessionId))
    .then((activeSession) => onSuccess(activeSession))
    .catch((err) => onError(err));
}

function startSessions(req, res) {
  const { userId, deviceIds, initiatedByDeviceId } = req.body;

  const onError = (err) => res.status(500).json({
    message: 'Error occurred while starting session.',
    error: err.message,
  });

  // TODO: check userId validness
  const sessionIds = deviceIds.map((deviceId) => `${userId}#${deviceId}`);
  const getActiveSeshPromises = sessionIds.map((sessionId) => getSessionIfActive(sessionId));

  return Promise.all(getActiveSeshPromises)
    .then((activeSessions) => {
      const sidsToActivate = sessionIds.flatMap((sid, index) => {
        if (activeSessions[index]) {
          return [];
        }
        return sid;
      });
      return batchCreateActiveSessions(initiatedByDeviceId, sidsToActivate)
        .then(() => res.sendStatus(200));
    })
    .catch((err) => {
      onError(err);
    });

  /*
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
    */
}

function endSessions(req, res) {
  const { userId, deviceIds } = req.body;
  // TODO: check input validness
  const sessionIds = deviceIds.map((deviceId) => `${userId}#${deviceId}`);
  const onError = (err) => res.status(500).json({
    message: 'Error occurred while ending session.',
    error: err.message,
  });
  const getActiveSeshPromises = sessionIds.map((sessionId) => getSessionIfActive(sessionId));

  return Promise.all(getActiveSeshPromises)
    .then((activeSessions) => {
      const setEndTimePromises = activeSessions
        .filter((sesh) => sesh != null)
        .map((activeSesh) => {
          const sessionId = activeSesh.session_id;
          const startTime = activeSesh.start_time;
          const endTime = Date.now().toString();
          return setEndTime(sessionId, startTime, endTime);
        });
      return Promise.all(setEndTimePromises)
        .then(() => res.sendStatus(200))
        .catch((err) => onError(err));
    });
}

router.get('/active', getActiveSession);
router.post('/start', startSessions);
router.post('/end', endSessions);

module.exports = router;
