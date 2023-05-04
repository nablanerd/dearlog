const {     S3Client,
    CreateBucketCommand,
    PutObjectCommand,
    ListObjectsCommand,
    DeleteObjectCommand ,
    GetObjectCommand} = require("@aws-sdk/client-s3");

    const fs = require('fs');

require('dotenv').config()

const { PassThrough } = require('stream');

const client = new S3Client({
    region: 'eu-west-3',
    credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    signatureVersion: 'v4',
});


const url = require('url');
const path = require("path");

(async () => {
   
//resetAllS3()
//console.log("resetAllS3");

})() /**/


async function _list_objects (client,  cb) {

    const listObjectsCommand = new ListObjectsCommand({
        Bucket: process.env.S3_BUCKET_NAME
    });

    const listResponse = await client.send(listObjectsCommand);

    console.info('Before deletion', (listResponse['Contents'] || []).map(({ Key }) => cb(Key)));   

}


async function _delete_object(key)
{
    const deleteObjectsCommand = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
    });

    await client.send(deleteObjectsCommand);


}
/* public */
async function getObjectFromS3(key)
{

    const getObjectCommand = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
    });

    return client.send(getObjectCommand);
}


/* public */
function resetAllS3()
{
    _list_objects(client, _delete_object)
}

/* public */
async function saveToS3(key, readStream)
{
    //const passThrough = new PassThrough();

    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: readStream
    });

    await client.send(putObjectCommand);

}

/* 
Download a large file.

aws
from

https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_Scenario_UsingLargeFiles_section.html
*/

//import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
//import { createWriteStream } from "fs";

//const s3Client = new S3Client({});
const oneMB = 1024 * 1024;

const getObjectRange = ({  key, start, end }) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Range: `bytes=${start}-${end}`,
  });

  return client.send(command);
};

const getRangeAndLength = (contentRange) => {
  const [range, length] = contentRange.split("/");
  const [start, end] = range.split("-");
  return {
    start: parseInt(start),
    end: parseInt(end),
    length: parseInt(length),
  };
};

const isComplete = ({ end, length }) => end === length - 1;

// When downloading a large file, you might want to break it down into
// smaller pieces. Amazon S3 accepts a Range header to specify the start
// and end of the byte range to be downloaded.
const downloadInChunks = async (key ) => {

    console.log("135 key", key);


const filePath = path.join(__dirname, key);

console.log("filePath", filePath);

  const writeStream = fs.createWriteStream(
    filePath
    //url.fileURLToPath(new URL(`./${key}` /* , import.meta.url */))
  
  
  
  
    ).on("error", (err) => console.error(err));

  let rangeAndLength = { start: -1, end: -1, length: -1 };

  while (!isComplete(rangeAndLength)) {
    const { end } = rangeAndLength;
    const nextRange = { start: end + 1, end: end + oneMB };

    console.log(`Downloading bytes ${nextRange.start} to ${nextRange.end}`);

    const { ContentRange, Body } = await getObjectRange({
      key,
      ...nextRange,
    });


    writeStream.write(await Body.transformToByteArray());
    
    
    rangeAndLength = getRangeAndLength(ContentRange);
  }
};








async function  _hyperStreaming(key, req,res)
{


console.log("212 key", key);

const filePath = path.join(__dirname, key);

console.log("filePath", filePath);

const writeStream = fs.createWriteStream(
  filePath  
  ).on("error", (err) => console.error(err));

let rangeAndLength = { start: -1, end: -1, length: -1 };

while (!isComplete(rangeAndLength)) {

  
  const { end } = rangeAndLength;
  const nextRange = { start: end + 1, end: end + oneMB };

  console.log(`Downloading bytes ${nextRange.start} to ${nextRange.end}`);

  const head = {
    'Content-Length': nextRange.end,
    'Content-Type': 'audio/webm',
};
res.writeHead(200, head);

  const { ContentRange, Body } = await getObjectRange({
    key,
    ...nextRange,
  });

  writeStream.write(await Body.transformToByteArray());

  writeStream.pipe(res)

  rangeAndLength = getRangeAndLength(ContentRange);
}


//fs.createReadStream(keyFile).pipe(res);



}


/* export const main = async () => {
  await downloadInChunks({
    bucket: "my-cool-bucket",
    key: "my-cool-object.txt",
  });
};
 */

/* */
module.exports = {
    resetAllS3:resetAllS3,
    saveToS3:saveToS3,
    //getObjectFromS3:getObjectFromS3,

    _hyperStreaming:_hyperStreaming


}