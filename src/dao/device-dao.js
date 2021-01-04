import docClient from './dynamodb-dao';

const DEVICES_TABLE_NAME = 'devices';

export default function getDevicesWithUserId(userId) {
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
