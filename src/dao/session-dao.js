import path from 'path';
import AWS from 'aws-sdk';

const SESSIONS_TABLE_NAME = 'guardian_sessions';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

AWS.config.region = process.env.REGION || 'us-east-1';
if (!IS_PRODUCTION) {
  const credsPath = path.join(__dirname, '..', 'aws-cred.json');
  AWS.config.loadFromPath(credsPath);
}

const docClient = new AWS.DynamoDB.DocumentClient();

export function getSessionIfActive(sessionId) {
  const params = {
    TableName: SESSIONS_TABLE_NAME,
    KeyConditionExpression: '#sid = :sid',
    Limit: 1,
    ScanIndexForward: false,
    ExpressionAttributeNames: {
      '#sid': 'session_id',
    },
    ExpressionAttributeValues: {
      ':sid': sessionId,
    },
  };

  return new Promise((res) => {
    docClient.query(params, (err, data) => {
      if (err || data.Items.length === 0 || data.Items[0].end_time) {
        return res(null);
      }
      return res(data.Items[0]);
    });
  });
}

export function createActiveSession(sessionId) {
  const startTime = Date.now().toString();
  const params = {
    TableName: SESSIONS_TABLE_NAME,
    Item: {
      session_id: sessionId,
      start_time: startTime,
    },
  };

  return new Promise((res, rej) => {
    docClient.put(params, (err, data) => {
      if (err) {
        return rej(err);
      }
      return res(data);
    });
  });
}

export function setEndTime(sessionId) {
  return new Promise((res, rej) => getSessionIfActive(sessionId)
    .then((session) => {
      if (!session) {
        return rej(new Error('User has no active session'));
      }
      const endTime = Date.now().toString();
      const params = {
        TableName: SESSIONS_TABLE_NAME,
        Item: {
          session_id: session.session_id,
          start_time: session.start_time,
          end_time: endTime,
        },
      };

      return docClient.put(params, (err) => {
        if (err) {
          return rej(err);
        }
        return res();
      });
    }));
}
