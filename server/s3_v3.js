const {     S3Client,
    CreateBucketCommand,
    PutObjectCommand,
    ListObjectsCommand,
    DeleteObjectCommand } = require("@aws-sdk/client-s3");

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


 
(async () => {
   
   resetAllS3()
console.log("resetAllS3");

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

module.exports = {
    resetAllS3:resetAllS3,
    saveToS3:saveToS3,
    getObjectFromS3:getObjectFromS3


}