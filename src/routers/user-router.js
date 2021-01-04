import { Router } from 'express';

import getDevicesWithUserId from '../dao/device-dao';

const router = Router();
const DEV_ONLINE_THRESHOLD_MINS = 5;

function computeStatusText(isActive, lastPingTs) {
  if (isActive) {
    return 'GUARDING';
  }
  const lastPingMinsAgo = (Date.now() - new Date(lastPingTs)) / (1000 * 60);
  if (lastPingMinsAgo <= DEV_ONLINE_THRESHOLD_MINS) {
    return 'ONLINE';
  }
  return 'OFFLINE';
}

function getUserDevices(req, res) {
  // const { userId } = req.body;
  const userId = 'user';

  const onError = (err) => res.status(500).json({
    message: 'Error occurred while retrieving user devices.',
    error: err.message,
  });

  const onSuccess = (deviceItems) => {
    const devices = deviceItems.map((deviceInfo) => {
      const name = deviceInfo.nickname || deviceInfo.uuid;
      const { location } = deviceInfo;
      const lastPinged = deviceInfo.last_ping_timestamp;
      const isActive = deviceInfo.is_active;
      const status = computeStatusText(isActive, parseInt(lastPinged, 10));

      return {
        name,
        location,
        status,
      };
    });

    return res.status(200).json({ devices });
  };

  return getDevicesWithUserId(userId)
    .then((deviceItems) => onSuccess(deviceItems))
    .catch((err) => onError(err));
}

router.get('/devices', getUserDevices);

module.exports = router;
