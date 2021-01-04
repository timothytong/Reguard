import path from 'path';
import AWS from 'aws-sdk';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

AWS.config.region = process.env.REGION || 'us-east-1';
if (!IS_PRODUCTION) {
  const credsPath = path.join(__dirname, '..', 'aws-cred.json');
  AWS.config.loadFromPath(credsPath);
}

export default new AWS.DynamoDB.DocumentClient();
