const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "AKIASGFKYS2OKBLYAPXO",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "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"
});

s3.config.region = "eu-west-3"

module.exports = s3