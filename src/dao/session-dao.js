import docClient from './dynamodb-dao';

const SESSIONS_TABLE_NAME = 'guardian_sessions';

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

export function batchCreateActiveSessions(initiatingDeviceId, sessionIds) {
  const startTime = Date.now().toString();
  const putRequests = sessionIds.map((sid) => ({
    PutRequest: {
      Item: {
        session_id: sid,
        start_time: startTime,
        initiated_by_device_id: initiatingDeviceId,
      },
    },
  }));
  const params = {
    RequestItems: {
      [SESSIONS_TABLE_NAME]: putRequests,
    },
  };

  return new Promise((res, rej) => {
    docClient.batchWrite(params, (err, data) => {
      if (err) {
        return rej(err);
      }
      return res(data);
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

export function setEndTime(sessionId, startTime, endTime) {
  return new Promise((res, rej) => {
    const params = {
      TableName: SESSIONS_TABLE_NAME,
      Key: {
        session_id: sessionId,
        start_time: startTime,
      },
      UpdateExpression: 'set #et = :et',
      ExpressionAttributeNames: {
        '#et': 'end_time',
      },
      ExpressionAttributeValues: {
        ':et': endTime,
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
