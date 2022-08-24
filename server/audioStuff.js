const s3 = require('./s3_v3.js');
const convertDate2Objet = require('../my_modules/date')

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
      duration : data.duration

    })
    db.Log.update(
      {content: audioDataContent},
      {where: {id: data.id}}
  )


  }


function _save_file_temporary (key)  {
    return new Promise((resolve, reject) => {
  
      stream.pipe(fs.createWriteStream(key))
      .on('close', () => resolve())
      .on('error', ()=> reject())
  
    })
  }


  function onlinePolicyUpload  (stream, log, db)
  {

    const key = _generateKeyFromDate(log)

    _save_file_temporary(key)
    .then((db, log)=>{

        _updateContent (db,log)

        readStream = fs.createReadStream(key);

        readStream
    .pipe(s3.saveToS3);


    })

  }

/* 
DOWNLOAD
*/

  function broadcast(db, id)
  {

   // const id = parseInt(req.params.id)

    db.Log.findByPk(id)
  .then((log)=>{

    const key = _generateKeyFromDate(log)

    //const audioKey = "2021_11_10_16_16_17_595.webm"
  
    _checkout_object(key)
    .then(()=> {
  
      console.log( "fs.existsSync(audioPath)", fs.existsSync(audioKey));
    
      _streaming(key)
    
    })
  
  
  })

  
  
  

  }
  

function _checkout_object  (key) {
    return new Promise((resolve, reject) => {

      
      if(!fs.existsSync(key))
      {
        const stream = fs.createWriteStream(key)
  
        s3.getObjectFromS3
        .createReadStream()
        .pipe(stream)
        .on('close', () => resolve())
        .on('error', ()=> reject())


/*         s3.getObject({Bucket: process.env.S3_BUCKET_NAME, Key: audioKey})
        .createReadStream()
        .pipe(stream)
        .on('close', () => resolve())
        .on('error', ()=> reject()) */

        
      }

      resolve()


    })
  }


function _streaming  (key) {
    const audioStat = fs.statSync(key);
    const fileSize = audioStat.size;
    const audioRange = req.headers.range;
  
    if (audioRange) {
        const parts = audioRange.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize-1;
        const chunksize = (end-start) + 1;
        
        const file = fs.createReadStream(key, {start, end});
    
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
      
        fs.createReadStream(audioKey).pipe(res);
    }
  
  }



  /* EXPORTS */
  module.exports = {
    
    onlinePolicyUpload:onlinePolicyUpload,
    broadcast:broadcast
    
  };