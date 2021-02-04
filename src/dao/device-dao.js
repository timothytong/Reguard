import docClient from './dynamodb-dao';

const DEVICES_TABLE_NAME = 'devices';

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
      return res(data.Items[0]);
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
      return res(data.Items);
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
