import path from 'path';
import AWS from 'aws-sdk';

const SESSIONS_TABLE_NAME = 'guardian_sessions';
const ACTIVE_PREFIX = 'ACTIVE#';
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
    KeyConditionExpression: '#sid = :sid and begins_with(#st, :active_kw)',
    Limit: 1,
    ScanIndexForward: false,
    ExpressionAttributeNames: {
      '#sid': 'session_id',
      '#st': 'start_time',
    },
    ExpressionAttributeValues: {
      ':sid': sessionId,
      ':active_kw': ACTIVE_PREFIX,
    },
  };

  return new Promise((res) => {
    docClient.query(params, (err, data) => {
      if (err || data.Items.length === 0) {
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
      start_time: `${ACTIVE_PREFIX}${startTime}`,
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
