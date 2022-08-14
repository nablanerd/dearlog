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
BOOT
 */  
const PORT = process.env.PORT || 8080;
//7827
//const PORT = 7827

server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
