'use strict';

const AWS = require('aws-sdk');
const express = require('express');
const bodyParser = require('body-parser');
const isProduction = process.env.NODE_ENV === 'production';

AWS.config.region = process.env.REGION || 'us-east-1';
if (!isProduction) {
    AWS.config.loadFromPath('./aws-cred.json');
}

const docClient = new AWS.DynamoDB.DocumentClient();

const SESSIONS_TABLE_NAME = 'guardian_sessions'

export function getUserActiveSession(userId, deviceId) {
    // TODO: `${userId}#${deviceId}`
    let sessionId = `user#uuid1`;

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
            ':active_kw': 'ACTIVE',
        }
    };

    return new Promise(res => {
        docClient.query(params, function(err, data) {
            if (err || data.Items.length == 0) {
                console.error('Unable to query. Error:', JSON.stringify(err, null, 2));
                res(null);
            } else {
                console.log('Query succeeded.');
                res(data.Items[0]);
            }
        });
    });
}

