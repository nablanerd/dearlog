const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
});

s3.config.region = "eu-west-3"

module.exports = s3