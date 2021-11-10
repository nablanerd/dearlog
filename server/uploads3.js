const fs = require('fs');
const AWS = require('aws-sdk');
const stream = require('stream');

const s3 = new AWS.S3({
    accessKeyId: "AKIASGFKYS2OKBLYAPXO",
    secretAccessKey: "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"
});

const filename = "2021_11_9_9_58_43_69.webm"

function uploadFromStream(s3) {
    const pass = new stream.PassThrough();
  
    // Setting up S3 upload parameters
    const params = {
        Bucket: "dearlogbucket",
        Key: filename, // File name you want to save as in S3
        Body: pass
    };

    s3.upload(params, function(err, data) {

      if (err) {
        throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);

    });
  
    return pass;
  }

readStream = fs.createReadStream(filename);

readStream
.pipe(uploadFromStream(s3));