'use strict';

import path from 'path';

const SESSIONS_TABLE_NAME = 'guardian_sessions'
const ACTIVE_PREFIX = "ACTIVE#";
const AWS = require('aws-sdk');

let isProduction = process.env.NODE_ENV === 'production';

AWS.config.region = process.env.REGION || 'us-east-1';
if (!isProduction) {
    let credsPath = path.join(__dirname, '..', 'aws-cred.json')
    AWS.config.loadFromPath(credsPath)
}

const docClient = new AWS.DynamoDB.DocumentClient();

export function getSessionIfActive(sessionId) {
    let params = {
        TableName: SESSIONS_TABLE_NAME,
        KeyConditionExpression: '#sid = :sid and begins_with(#st, :active_kw)',
        Limit: 1,
        ScanIndexForward: false,
        ExpressionAttributeNames:{
            '#sid': 'session_id',
            '#st': 'start_time',
        },
        ExpressionAttributeValues: {
            ':sid': sessionId,
            ':active_kw': ACTIVE_PREFIX,
        }
    };

    return new Promise(res => {
        docClient.query(params, function(err, data) {
            if (err || data.Items.length == 0) {
                return res(null);
            } else {
                return res(data.Items[0]);
            }
        });
    });
}

export function createActiveSession(sessionId) {
    let startTime = Date.now().toString();

    let params = {
        TableName: SESSIONS_TABLE_NAME,
        Item: {
            session_id: sessionId,
            start_time: `${ACTIVE_PREFIX}${startTime}`,
        }
    };

    return new Promise((res, rej) => {
        docClient.put(params, function(err, data) {
            if (err) {
                return rej(err);
            }
            res(data);
        });
    });
}

