import docClient from './dynamodb-dao';

const EVENTS_TABLE_NAME = 'guardian_events';

export default function getEventsForUser(userId) {
  const params = {
    TableName: EVENTS_TABLE_NAME,
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
        console.log('Error fetching user events from DynamoDB');
        console.trace(err);
        return rej(err);
      }
      return res(data.Items);
    });
  });
}
