import docClient from './dynamodb-dao';

const DEV_ONLINE_THRESHOLD_MINS = 5;
const DEVICES_TABLE_NAME = 'devices';

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

function buildDeviceFromRecord(deviceInfo) {
  if (!deviceInfo) {
    return null;
  }

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
}

export function getUserDeviceInfo(userId, deviceId) {
  const params = {
    TableName: DEVICES_TABLE_NAME,
    KeyConditionExpression: '#uid = :uid and #did = :did',
    ExpressionAttributeNames: {
      '#uid': 'user_id',
      '#did': 'device_id',
    },
    ExpressionAttributeValues: {
      ':uid': userId,
      ':did': deviceId,
    },
  };

  return new Promise((res, rej) => {
    docClient.query(params, (err, data) => {
      if (err) {
        console.log('Error fetching user device from DynamoDB');
        console.trace(err);
        return rej(err);
      }
      return res(buildDeviceFromRecord(data.Items[0]));
    });
  });
}

export function getDevicesWithUserId(userId) {
  const params = {
    TableName: DEVICES_TABLE_NAME,
    KeyConditionExpression: '#uid = :uid',
    ExpressionAttributeNames: {
      '#uid': 'user_id',
    },
    ExpressionAttributeValues: {
      ':uid': userId,
    },
  };

  return new Promise((res, rej) => {
    docClient.query(params, (err, data) => {
      if (err) {
        console.log('Error fetching user devices from DynamoDB');
        console.trace(err);
        return rej(err);
      }
      return res(data.Items.map((deviceItem) => buildDeviceFromRecord(deviceItem)));
    });
  });
}

export function refreshLastPingedTs(userId, deviceId) {
  return new Promise((res, rej) => {
    const params = {
      TableName: DEVICES_TABLE_NAME,
      Key: {
        user_id: userId,
        device_id: deviceId,
      },
      UpdateExpression: 'set #lpt = :lpt',
      ConditionExpression: 'attribute_exists(user_id)',
      ExpressionAttributeNames: {
        '#lpt': 'last_ping_timestamp',
      },
      ExpressionAttributeValues: {
        ':lpt': Date.now().toString(),
      },
    };

    return docClient.update(params, (err) => {
      if (err) {
        return rej(err);
      }
      return res();
    });
  });
}
