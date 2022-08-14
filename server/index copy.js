const express = require('express');
const bodyParser = require('body-parser');
const db = require('../models'); // new require for db object
const path = require('path')
const Joi = require('joi')
const cors = require('cors');

//const stream = require('stream');
const { PassThrough } = require('stream');

const s3 = require("./s3")

//const cll = require ("./cll");

const mkdirp = require('mkdirp')

const app = express();

var ss = require('socket.io-stream');

const fs = require('fs');

const convertDate2Objet = require('../my_modules/date')

const server = require('http').Server(app)
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})



app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, '../public')));

app.use(cors());

/* 
HEROKU
*/

app.get('/heroku', (req, res) => {

  res
  .status(200)
  .send('Hello server is running')
  .end();

})

/* 
IDS PREV/NEXT
*/
app.get('/api/logs/nextprev/:id', (req, res) => {

const id = parseInt(req.params.id)

return db.Log.findAll({
  attributes: ['id'],
  order: [['createdAt', 'ASC']]
})
.then((ids) => {

let next, prev;
let ids_flat = ids.map(i => i.id)

if(ids_flat.indexOf(id)<0)
{
 return res.status(422).json({ 
        message: `Invalid request ERROR: ID ${req.params.id}`, 
        data: "body" 
      }) 
}


let index = ids_flat.indexOf(id)

let pos_p = index-1 < 0 ? ids_flat.length-1 : index-1
let pos_n = index+1 == ids_flat.length ? 0 : index+1

prev = ids_flat[pos_p]
next = ids_flat[pos_n]

res.send({
  prev:prev,
  next:next
})

})
.catch((err) => {
        console.log('There was an error querying logs next/prev', JSON.stringify(err))
        return res.send(err)
      });


})

/*
LOGS
*/
app.get('/api/logs', (req, res) => {
  //, attributes: ['id', 'title', 'description']

    return db.Log.findAll( {order: [['title', 'DESC']] , include: ['namespace']})
      .then((logs) => res.send(logs))
      .catch((err) => {
        console.log('There was an error querying logs', JSON.stringify(err))
        return res.send(err)
      });
  });

app.get('/api/logs/:id', (req, res) => {
    const id = parseInt(req.params.id)
 
 return db.Log.findByPk(id,  {include: ['namespace', 'tags']})
 .then((log) => {

   res.send(log)
   
 })
 .catch((err) => {
        console.log('There was an error querying log by id', JSON.stringify(err))
        return res.send(err) 
  });
 });

app.post('/api/logs', (req, res) => {
    const { title, description, content, heart, namespace, tags, type } = req.body

   // const namespaceId = namespace.id
   
    return db.Log.create( {title, description, content, heart, /* id_namespace : namespaceId, */ /* tag, */ type })
      .then(async (log) => {


       const n  = await db.Namespace.findByPk(namespace?.id)
        log.setNamespace(n)


        const tagsObjects = []

        for (tag of tags)
        {
          const t = await db.Tag.findByPk(tag.id)

          tagsObjects.push(t)

        }
        
        console.log("tagsObjects", tagsObjects);

        log.setTags(tagsObjects)

        res.send(log)
      
      })
      .catch((err) => {
        console.log('There was an error creating logs', JSON.stringify(log))
        return res.status(400).send(err)
      })
  });
  
  app.put('/api/logs/:id', (req, res) => {
    const id = parseInt(req.params.id)

    const idSchema = Joi.number();
    const result = idSchema.validate(id); 
    const { value, error } = result; 
    const valid = error == null; 

    if (!valid) { 
      return res.status(422).json({ 
        message: `PUT Invalid request ERROR: ${req.params.id}`, 
        data: "body" 
      }) 
    } else { 

        return db.Log.findByPk(id)
        .then((log) => {

        /*   console.log(namespace);

    const namespaceId = namespace.id

    return db.Log.create( {title, description, content, heart, id_namespace : namespaceId, tag, type }) */
          

    const { title, description, content, heart, namespace, tags,type }  = req.body

    // const namespaceId = namespace.id

          return log.update({ title, description, content, heart,/* id_namespace : namespaceId,  tag, */type } )
            .then(async () => {
              
              const n  = await db.Namespace.findByPk(namespace?.id)
              log.setNamespace(n)

              const tagsObjects = []

              for (tag of tags)
              {
                const t = await db.Tag.findByPk(tag?.id)
      
                tagsObjects.push(t)
      
              }
              
              console.log("tagsObjects", tagsObjects);
      
              log.setTags(tagsObjects)
              
              res.send(log)
            
            })
            .catch((err) => {
              console.log('There was an error updating log', JSON.stringify(err))
              res.status(400).send(err)
            })
        })

      }

  });

  app.delete('/api/logs/:id', (req, res) => {

    const id = parseInt(req.params.id)
    return db.Log.findByPk(id)
      .then((log) => {
        if(log ===  null) return res.status(400).send("ID unknow "+id)

        log.setTags(null)
        log.setNamespace(null)

        log.destroy({ force: true })
    })
      .then(() => res.status(200).json({"id":id} ))
      .catch((err) => {
        console.log('There was an error deleting log', JSON.stringify(err))
        res.status(400).send(err)
      })
  });
  
 
/*
NAMESPACE
*/

app.get('/api/namespaces', (req, res) => {

  return db.Namespace.findAll({include: ['logs']})
  .then((namespaces) => res.send(namespaces))
  .catch((err) => {
    console.log('There was an error querying namespaces', JSON.stringify(err))
    return res.send(err)
  });

})

app.get('/api/namespaces/:id', (req, res) => {
  const id = parseInt(req.params.id)

return db.Namespace.findByPk(id, {include: ['logs']})
.then((namespace) => {

 res.send(namespace)
 
})
.catch((err) => {
      console.log('There was an error querying namespace by id', JSON.stringify(err))
      return res.send(err) 
});
});

app.post('/api/namespaces', (req, res) => {

  const { name, description } = req.body

   return db.Namespace.create( { name, description })
    .then((namespace) => res.send(namespace))
    .catch((err) => {
      console.log('***There was an error creating a namespace', JSON.stringify(namespace))
      return res.status(400).send(err)
    }) 

  });


  app.put('/api/namespaces/:id', (req, res) => {
    const id = parseInt(req.params.id)

    const { name, description }  = req.body

        return db.Namespace.findByPk(id)
        .then((namespace) => {

          return namespace.update({ name, description  } )
            .then(() => res.send(namespace))
            .catch((err) => {
              console.log('There was an error querying namespace by id', JSON.stringify(err))
              res.status(400).send(err)
            })
        })

  });

  app.delete('/api/namespaces/:id', (req, res) => {

    const id = parseInt(req.params.id)
  
    return db.Namespace.findByPk(id)
      .then((namespace) => {
        if(namespace ===  null) return res.status(400).send("ID unknow "+id)
        
        namespace.setLogs(null)

        namespace.destroy({ force: true })
    })
      .then(() => res.status(200).json({"id":id} ))
      .catch((err) => {
        console.log('There was an error deleting namespace', JSON.stringify(err))
        res.status(400).send(err)
      })
  });

  
/*
TAGS
*/
app.get('/api/tags', (req, res) => {

  return db.Tag.findAll({include: ['logs']})
  .then((tags) => res.send(tags))
  .catch((err) => {
    console.log('There was an error querying tags', JSON.stringify(err))
    return res.send(err)
  });

})

app.get('/api/tags/:id', (req, res) => {
  const id = parseInt(req.params.id)

return db.Tag.findByPk(id, {include: ['logs']})
.then((tag) => {

 res.send(tag)
 
})
.catch((err) => {
      console.log('There was an error querying tag by id', JSON.stringify(err))
      return res.send(err) 
});
});

app.post('/api/tags', (req, res) => {
  const { name, description }  = req.body

  return db.Tag.create( {name, description })
    .then((tag) => res.send(tag))
    .catch((err) => {
      console.log('***There was an error creating a tag', JSON.stringify(log))
      return res.status(400).send(err)
    })
});

app.put('/api/tags/:id', (req, res) => {
  const id = parseInt(req.params.id)

  const { name, description }  = req.body

      return db.Tag.findByPk(id)
      .then((tag) => {
        return tag.update({ name, description  } )
          .then(() => res.send(tag))
          .catch((err) => {
            console.log('There was an error querying tag by id', JSON.stringify(err))
            res.status(400).send(err)
          })
      })

  
});

app.delete('/api/tags/:id', (req, res) => {

  const id = parseInt(req.params.id)

  return db.Tag.findByPk(id)
    .then((tag) => {
      if(tag ===  null) return res.status(400).send("ID unknow "+id)

      tag.setLogs(null)
      tag.destroy({ force: true })
  })
    .then(() => res.status(200).json({"id":id} ))
    .catch((err) => {
      console.log('There was an error deleting tag', JSON.stringify(err))
      res.status(400).send(err)
    })
});

/*
RELATIONS
*/

// '/logsbytagid'
/* 
app.get('/api/tags/:id/logs', (req, res) => {

  // const id = 3
 
  const id = parseInt(req.params.id)

return db.Tag.findByPk(id, {include: ['logs']})
.then((tag) => {

console.log(tag);
  res.send(tag?.logs)
  
})
.catch((err) => {
       console.log('There was an error querying log by id', JSON.stringify(err))
       return res.send(err) 
 });

})


app.get('/api/namespaces/:id/logs', (req, res) => {

  // const id = 3
 
  const id = parseInt(req.params.id)

return db.Namespace.findByPk(id, {include: ['logs']})
.then((namespace) => {

console.log(tag);
  res.send(namespace?.logs)
  
})
.catch((err) => {
       console.log('There was an error querying log by id', JSON.stringify(err))
       return res.send(err) 
 });

})
 */

/* 
app.post('/log/:idlog/tag/:idtag', (req, res) => {

})

app.put('/log/:idlog/tag/:idtag', (req, res) => {

})

app.get('/addtag', (req, res) => {

  const id = 18
 
return db.Log.findByPk(id, {include: ['tags']})
.then(async (log) => {

 // const foo = await db.Tag.create({ name: 'final' });

db.Tag.findByPk(7999)
.then((tag) => {


  console.log("newTag", tag);

  if(tag)
  {
  log.setTags(
    // foo
   [tag]
  )
  
}
    res.send(log)

})


  
})
.catch((err) => {
       console.log('There was an error querying log by id', JSON.stringify(err))
       return res.send(err) 
 });

})
 */

/*
SEARCH
*/
/* 
app.get('/api/logs/search/:query', async (req, res) => {
  const query = req.params.query

  const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

sequelize = new Sequelize(config.database, config.username, config.password, config);

//'${query}'
 const sql = `SELECT * FROM log_fts WHERE log_fts MATCH "vvv" ORDER BY rank;`

 const [results, metadata] = await sequelize.query(sql);

console.log("results", results);
console.log("metadata", metadata);

res.status(400).send({})

 //return $data;

}); */

/*
STREAM
*/

const offlinePolicyUpload = (stream, data) => {

  console.log(data.createdAt)
  const createdAt = data.createdAt

  const duration = data.duration
  
  console.log("createdAt"+createdAt);   
  const dateObject = convertDate2Objet(createdAt)

  const path = `./media/audio/${dateObject.year}/${dateObject.month}/${dateObject.day}/`

  const name = `${dateObject.year}_${dateObject.month}_${dateObject.day}_${dateObject.hour}_${dateObject.minute}_${dateObject.second}_${dateObject.millisecond}`
  const ext ="webm"

  const filename = path + name+ '.' + ext;

  console.log("filename=", filename);


  const updateContent = () => {

    const dataContent = JSON.stringify({
      isRecorded : true,
      duration : duration

    })
    db.Log.update(
      {content: dataContent},
      {where: {id: data.id}}
  )


  }


  if (!fs.existsSync(path))
  {

mkdirp(path)
.then(made => console.log(`made directories, starting with ${made}`))
.then(() => {
  stream.pipe(fs.createWriteStream(filename))


})
.then(()=>{

updateContent()

})
.catch(() => console.log("cant create directory"))

}
else {

console.log("else")

const save_to_file = () => {
  return new Promise((resolve, reject) => {

    stream.pipe(fs.createWriteStream(filename))
    .on('close', () => resolve())
    .on('error', ()=> reject())

  })
}

save_to_file()
.then(() => {

  updateContent()

})
.catch(() => console.log("error saving audio file"))

}

}

const onlinePolicyUpload = (stream, data) =>{

  const createdAt = data.createdAt
  const duration = data.duration

  const dateObject = convertDate2Objet(createdAt)

  const name = `${dateObject.year}_${dateObject.month}_${dateObject.day}_${dateObject.hour}_${dateObject.minute}_${dateObject.second}_${dateObject.millisecond}`
  const ext ="webm"

  const filename = name+ '.' + ext;

  const updateContent = () => {

    const audioDataContent = JSON.stringify({
      isRecorded : true,
      duration : duration

    })
    db.Log.update(
      {content: audioDataContent},
      {where: {id: data.id}}
  )


  }


 /*  if (!fs.existsSync(filename))
  { */
    const save_file_temporary = () => {
    return new Promise((resolve, reject) => {
  
      stream.pipe(fs.createWriteStream(filename))
      .on('close', () => resolve())
      .on('error', ()=> reject())
  
    })
  }
  /* }
 */

  const  uploadFromStream = (s3) => {
   // const pass = new stream.PassThrough();
  
    const passThrough = new PassThrough();

    // Setting up S3 upload parameters
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filename, // File name you want to save as in S3
        Body: passThrough,

    };

    s3.upload(params, function(err, data) {
      if (err) {
        throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);

    });
  
    return passThrough;
  }

  save_file_temporary()
.then(() => {

    updateContent()

    readStream = fs.createReadStream(filename);

    readStream
    .pipe(uploadFromStream(s3));

})

}

io.of('/audio').on('connection', function(socket) {

  ss(socket).on('audiostream', onlinePolicyUpload);


});


const offlinePolicyStream = (log)=> {

  const dateObject = convertDate2Objet(log.createdAt)

  const path = `./media/audio/${dateObject.year}/${dateObject.month}/${dateObject.day}/`
  const name = `${dateObject.year}_${dateObject.month}_${dateObject.day}_${dateObject.hour}_${dateObject.minute}_${dateObject.second}_${dateObject.millisecond}`
  const ext ="webm"
  
  const audioPath = path + name+ '.' + ext;
  
  const audioStat = fs.statSync(audioPath);
  const fileSize = audioStat.size;
  const audioRange = req.headers.range;
  if (audioRange) {
      const parts = audioRange.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1]
          ? parseInt(parts[1], 10)
          : fileSize-1;
      const chunksize = (end-start) + 1;
      
      /* if exist ? */
      const file = fs.createReadStream(audioPath, {start, end});
  
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
      fs.createReadStream(audioPath).pipe(res);
  }

}


const _onlinePolicyStream = (log, res)=> {

  const dateObject = convertDate2Objet(log.createdAt)

  const name = `${dateObject.year}_${dateObject.month}_${dateObject.day}_${dateObject.hour}_${dateObject.minute}_${dateObject.second}_${dateObject.millisecond}`
  const ext ="webm"
  
  const audioPath = name+ '.' + ext;
  
  const checkout_object = () => {
    return new Promise((resolve, reject) => {
  
      const stream = fs.createWriteStream(audioPath)

      s3.getObject({Bucket: process.env.S3_BUCKET_NAME, Key: audioPath})
      .createReadStream()
      .pipe(stream)
      .on('close', () => resolve())
      .on('error', ()=> reject())

    })
  }


 /*    if (!fs.existsSync(audioPath))
    {
      const stream = fs.createWriteStream(audioPath)
    
      try {
    s3.getObject({Bucket: process.env.S3_BUCKET_NAME, Key: audioPath})
    .createReadStream()
    .pipe(stream);
    
  }
  catch (e)
  {
console.log("s3.getObject", e);

  }
    } */

    const streaming = ()=> {
  const audioStat = fs.statSync(audioPath);
  const fileSize = audioStat.size;
  const audioRange = req.headers.range;

  if (audioRange) {
      const parts = audioRange.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1]
          ? parseInt(parts[1], 10)
          : fileSize-1;
      const chunksize = (end-start) + 1;
      
      const file = fs.createReadStream(audioPath, {start, end});
  
      const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/webm',
      };
      res.writeHead(206, head);

    /*   s3.getObject({Bucket: process.env.S3_BUCKET_NAME, Key: audioPath})
      .createReadStream()
      .pipe(res) */

      //src.pipe(res)

      file.pipe(res);
  } else {
      const head = {
          'Content-Length': fileSize,
          'Content-Type': 'audio/webm',
      };
      res.writeHead(200, head);
      
   /*    s3.getObject({Bucket: "dearlogbucket", Key: "2021_11_9_9_58_43_69.webm"})
      .createReadStream()
      .pipe(res) */

      fs.createReadStream(audioPath).pipe(res);
  }

}

checkout_object()
.then((res)=> {

  console.log( fs.existsSync(audioPath), fs.existsSync(audioPath));

  res
  .status(200)
  .send('Hello server is running')
  .end();

 // streaming()

})
}

app.get('/audio/:id', (req, res) => {

  const id = parseInt(req.params.id)

  db.Log.findByPk(id)
.then((log)=>{

  const dateObject = convertDate2Objet(log.createdAt)

  const name = `${dateObject.year}_${dateObject.month}_${dateObject.day}_${dateObject.hour}_${dateObject.minute}_${dateObject.second}_${dateObject.millisecond}`
  const ext ="webm"
  
  const audioKey = name+ '.' + ext;

  //const audioKey = "2021_11_10_16_16_17_595.webm"

  const checkout_object = () => {
    return new Promise((resolve, reject) => {

      
      if(!fs.existsSync(audioKey))
      {
        const stream = fs.createWriteStream(audioKey)
  
        s3.getObject({Bucket: process.env.S3_BUCKET_NAME, Key: audioKey})
        .createReadStream()
        .pipe(stream)
        .on('close', () => resolve())
        .on('error', ()=> reject())

        
      }

      resolve()


    })
  }

  const streaming = ()=> {
    const audioStat = fs.statSync(audioKey);
    const fileSize = audioStat.size;
    const audioRange = req.headers.range;
  
    if (audioRange) {
        const parts = audioRange.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize-1;
        const chunksize = (end-start) + 1;
        
        const file = fs.createReadStream(audioKey, {start, end});
    
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

  checkout_object()
  .then(()=> {

    console.log( "fs.existsSync(audioPath)", fs.existsSync(audioKey));
  
    streaming()
  
  })


})
  //const audioPath = "./2021_11_10_16_16_17_595.webm";
  //checkout_object()




})


/* app.get('/audio/:id', (req, res) => {
  
  const id = parseInt(req.params.id)

  db.Log.findByPk(id)
 
.then(onlinePolicyStream)
.catch((err) => {
      console.log('There was an error querying log by id', JSON.stringify(err))
      return res.send(err) 
})
 
})
 */
const PORT = process.env.PORT || 8080;
//7827
//const PORT = 7827

server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});


const main = () => {

  if (!fs.existsSync('./media/audio'))
  {
    mkdirp('./media/audio/').then(made => console.log(`made directories, starting with ${made}`))

  }

  

}

//main()






console.log("process.env", process.env);