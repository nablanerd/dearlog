

const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});




s3.config.region = "eu-west-3"


/* var bucketParams = {
    Bucket : 'BUCKET_NAME',
  }; */

function list_objects (s3, bucketParams, cb) {

    s3.listObjects(bucketParams, function(err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", cb(data));
        }

    })

}

//export const bucketParams = { Bucket: "BUCKET_NAME", Key: "KEY" };

async function delete_object(s3, bucketParams, cb)
{

    
    s3.deleteObjects(bucketParams, function(err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", cb(data));
        }

    })


    
}


function reset()
{

    const bucketParams_list = {
        Bucket : process.env.S3_BUCKET_NAME
      }; 

    list_objects(s3, bucketParams_list, (data)=>{


        console.log(data);


    })


}