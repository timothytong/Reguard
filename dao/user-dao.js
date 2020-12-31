var AWS = require('aws-sdk'); var express = require('express');
var bodyParser = require('body-parser');

AWS.config.region = process.env.REGION

const sns = new AWS.SNS();
const ddb = new AWS.DynamoDB();

const userTable = "users"

export function addUser(id, hash, salt, name) {
}
