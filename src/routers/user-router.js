import { Router } from 'express';

import { getDevicesWithUserId, getUserDeviceInfo } from '../dao/device-dao';
import getEventsForUser from '../dao/event-dao';

const router = Router();

function getUserDevice(req, res) {
  const { deviceId, userId } = req.params;

  const onError = (err) => res.status(500).json({
    message: 'Error occurred while retrieving user device.',
    error: err.message,
  });

  return getUserDeviceInfo(userId, deviceId)
    .then((device) => res.status(200).json({ device }))
    .catch((err) => onError(err));
}

function getUserDevices(req, res) {
  const { userId } = req.params;

  const onError = (err) => res.status(500).json({
    message: 'Error occurred while retrieving user devices.',
    error: err.message,
  });

  return getDevicesWithUserId(userId)
    .then((devices) => res.status(200).json({ devices }))
    .catch((err) => onError(err));
}

function getUserEvents(req, res) {
  const { userId } = req.params;

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

router.get('/:userId/device/:deviceId', getUserDevice);
router.get('/:userId/devices', getUserDevices);
router.get('/:userId/events', getUserEvents);

module.exports = router;
