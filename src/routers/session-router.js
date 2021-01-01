'use strict';

import { Router }  from 'express';
import { getUserActiveSession }  from '../dao/session-dao.js';

const MOUNT_PATH = '/api/v1/sessions';
const router = Router();

function getActiveSession(req, res) {
    const { userId, deviceId } = req.body;

    const onSuccess = (activeSession) => {
        return res.status(200).json({
            activeSession
        });
    };

    const onError = (err) => {
        return res.status(500).json({
            message: 'Unexpected error occurred while retrieving active sesison.',
            error: err,
        });
    };

    getUserActiveSession(userId, deviceId)
        .then((activeSession) => onSuccess(activeSession))
        .catch((err) => onError(err));
}

router.get('/active', getActiveSession)

module.exports = router;

