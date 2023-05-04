const s3 = require('./s3_v3.js');
const convertDate2Objet = require('../my_modules/date')
const fs = require('fs');


/* 
UPLOAD
*/
  
function _generateKeyFromDate(log)
{
    const createdAt = log.createdAt
    const dateObject = convertDate2Objet(createdAt)

    const name = `${dateObject.year}_${dateObject.month}_${dateObject.day}_${dateObject.hour}_${dateObject.minute}_${dateObject.second}_${dateObject.millisecond}`
    const ext ="webm"
  
    const key = name+ '.' + ext;

    return key


}


function _updateContent (db,data) {


    const audioDataContent = JSON.stringify({
      isRecorded : true,
     /* #@ */ duration : data.duration

    })
    db.Log.update(
      {content: audioDataContent},
      {where: {id: data.id}}
  )


  }


function _save_file_temporary (stream, key)  {
    return new Promise((resolve, reject) => {
  
      stream.pipe(fs.createWriteStream(key))
      .on('close', () => resolve())
      .on('error', ()=> reject())
  
    })
  }


function onlinePolicyUpload  (db)
{

    function p (stream, data)  {

        const key = _generateKeyFromDate(data)

        _save_file_temporary(stream, key)
        .then(()=>{
    
            console.log("onlinePolicyUpload then", data);

           _updateContent (db,data)
    
            readStream = fs.createReadStream(key)
    /* 
            readStream
        .pipe(s3.saveToS3(key, readStream));
     */
    
        s3.saveToS3(key, readStream)

        })


    }

  return p

}


function offLinePolicyUpload  (db)
{


  function p (stream, data)  {

    const key = _generateKeyFromDate(data)

    _save_file_temporary(stream, key)
    .then(()=>{

        console.log("onffPolicyUpload then", data);

       _updateContent (db,data)

    })


}

return p


}
/* 
DOWNLOAD
*/

  function broadcast(db, req,res)
  {
    const id = parseInt(req.params.id)

   // const id = parseInt(req.params.id)

    db.Log.findByPk(id)
  .then((log)=>{

    const key = _generateKeyFromDate(log)

    //const audioKey = "2021_11_10_16_16_17_595.webm"
  
    _checkout_object(key)
    .then(()=> {
  
      console.log( "fs.existsSync(audioPath)", fs.existsSync(key));
    
      _streaming(key, req,res)
    
    })
  
  
  })

  
  
  

  }
  

function  _checkout_object  (key) {
    return new Promise(async (resolve, reject) => {

      
      if(!fs.existsSync(key))
      {
       // const stream = fs.createWriteStream(key)


       console.log("key", key);

       await s3.downloadInChunks(key)
  
       /*  s3.getObjectFromS3
        .Body
        ///.createReadStream()
        .pipe(stream)
        .on('close', () => resolve())
        .on('error', ()=> reject())
 */

        
        /* 
        
        //https://stackoverflow.com/questions/68630542/s3-getobject-createreadstream-is-not-a-function
        
        const response = await s3.getObject({
          Bucket: BUCKET_NAME,
          Key: key,
      });
      
      response.Body.pipe(res); */

/*         s3.getObject({Bucket: process.env.S3_BUCKET_NAME, Key: audioKey})
        .createReadStream()
        .pipe(stream)
        .on('close', () => resolve())
        .on('error', ()=> reject()) */

        
        resolve()

      }

      resolve()


    })
  }


function _streaming  (key, req,res) {
  const keyFile = "/app/server/"+key

    const audioStat = fs.statSync(keyFile);
    const fileSize = audioStat.size;
    const audioRange = req.headers.range;
  
    if (audioRange) {
        const parts = audioRange.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize-1;
        const chunksize = (end-start) + 1;
        
        const file = fs.createReadStream(keyFile, {start, end});
    
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'audio/webm',
        };
        res.writeHead(206, head);
  
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'audio/webm',
        };
        res.writeHead(200, head);
      
        fs.createReadStream(keyFile).pipe(res);
    }
  
  }



  /* EXPORTS */
  module.exports = {
    
    onlinePolicyUpload:onlinePolicyUpload,
    offLinePolicyUpload:offLinePolicyUpload,
    
    broadcast:broadcast
    
  };