import { Router } from 'express';

import getDevicesWithUserId from '../dao/device-dao';
import getEventsForUser from '../dao/event-dao';

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
      const id = deviceInfo.device_id;
      const name = deviceInfo.nickname || id;
      const { location } = deviceInfo;
      const lastPinged = deviceInfo.last_ping_timestamp;
      const isActive = deviceInfo.is_active;
      const status = computeStatusText(isActive, parseInt(lastPinged, 10));

      return {
        id,
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

function getUserEvents(req, res) {
  // const { userId } = req.body;
  const userId = 'user';

  const onError = (err) => res.status(500).json({
    message: 'Error occurred while retrieving user events.',
    error: err.message,
  });

  const onSuccess = (eventItems) => {
    const events = eventItems.flatMap((eventItem) => {
      const eventId = eventItem.event_id;
      const videoUrl = eventItem.video_url;
      const eventIdSegs = eventId.split('@@');
      if (eventIdSegs.length !== 2) {
        console.log(`Malformed eventId detected for guardian event: ${eventId}`);
        return [];
      }
      const eventTimestamp = eventIdSegs[0];
      const deviceId = eventIdSegs[1];

      return {
        deviceId,
        eventTimestamp,
        videoUrl,
      };
    });
    return res.status(200).json({ events });
  };

  return getEventsForUser(userId)
    .then((eventItems) => onSuccess(eventItems))
    .catch((err) => onError(err));
}

router.get('/devices', getUserDevices);
router.get('/events', getUserEvents);

module.exports = router;
