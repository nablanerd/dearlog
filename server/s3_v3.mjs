/* import  {
    S3Client,
    CreateBucketCommand,
    PutObjectCommand,
    ListObjectsCommand,
    DeleteObjectCommand
} from '@aws-sdk/client-s3';

import 'dotenv/config' */

const {     S3Client,
    CreateBucketCommand,
    PutObjectCommand,
    ListObjectsCommand,
    DeleteObjectCommand } = require("@aws-sdk/client-s3");

require('dotenv').config()

//dearloagaccesspoint-n8rhgzq8hkor8pgd1zsxcg4mgq3deeuw3a-s3alias

const client = new S3Client({
   // endpoint: 'arn:aws:s3:eu-west-3:150681982620:accesspoint/dearloagaccesspoint',
    region: 'eu-west-3',
    credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    signatureVersion: 'v4',
});



(async () => {
   
   // resetAllS3()


})()


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
function resetAllS3()
{
    _list_objects(client, _delete_object)
}

/* public */
async function saveToS3(key, file_content)
{
    const passThrough = new PassThrough();

    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: passThrough
    });

    await client.send(putObjectCommand);

}

/* public */
async function getFromS3(key)
{


    return ""
}


module.exports = {
    resetAllS3:resetAllS3,
    saveToS3:saveToS3,
    getFromS3:getFromS3


}