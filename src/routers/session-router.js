'use strict';

import { Router }  from 'express';
import { getSessionIfActive, createActiveSession }  from '../dao/session-dao.js';

const MOUNT_PATH = '/api/v1/sessions';
const router = Router();

function getActiveSession(req, res) {
    const { userId, deviceId } = req.body;

    const onSuccess = (activeSession) => {
        return res.status(200).json({ activeSession });
    };

    const onError = (err) => {
        return res.status(500).json({
            message: 'Unexpected error occurred while retrieving active session.',
            error: err,
        });
    };

    // TODO: `${userId}#${deviceId}`
    let sessionId = `user#uuid1`;

    getSessionIfActive(sessionId)
        .then((activeSession) => onSuccess(activeSession))
        .catch((err) => onError(err));
}

function startSession(req, res) {
    const { userId, deviceId } = req.body;

    const onError = (err) => {
        return res.status(500).json({
            message: 'Error occurred while starting session.',
            error: err,
        });
    };

    // TODO: `${userId}#${deviceId}`
    let sessionId = `user#uuid2`;

    getSessionIfActive(sessionId)
        .then((activeSession) => {
            if (!activeSession) {
                return createActiveSession(sessionId)
                    .then((data) => {
                        return res.sendStatus(200);
                    })
                    .catch((err) => {
                        onError(err);
                    });
            } else {
                console.log(`User ${userId} already has an active session!`);
                return res.sendStatus(202);
            }
        });
}

router.get('/active', getActiveSession);
router.post('/start', startSession);

module.exports = router;

