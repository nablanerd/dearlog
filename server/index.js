const express = require('express');
const bodyParser = require('body-parser');
const db = require('../models'); // new require for db object
const path = require('path')
const Joi = require('joi')
const cors = require('cors');

const cll = require ("./cll");

const app = express();

app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, '../public')));
app.use(cors());

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
        console.log('There was an error querying logs', JSON.stringify(err))
        return res.send(err)
      });


})

app.get('/api/logs', (req, res) => {
    return db.Log.findAll()
      .then((logs) => res.send(logs))
      .catch((err) => {
        console.log('There was an error querying logs', JSON.stringify(err))
        return res.send(err)
      });
  });

app.get('/api/logs/:id', (req, res) => {
    const id = parseInt(req.params.id)
 
 return db.Log.findByPk(id)
 .then((log) => res.send(log))
 .catch((err) => {
        console.log('There was an error querying log by id', JSON.stringify(err))
        return res.send(err) 
  });
 });

app.post('/api/logs', (req, res) => {
    const { title, content, heart, namespace, tag } = req.body

    return db.Log.create( {title, content, heart, namespace, tag })
      .then((log) => res.send(log))
      .catch((err) => {
        console.log('***There was an error creating a contact', JSON.stringify(log))
        return res.status(400).send(err)
      })
  });
  
  app.delete('/api/logs/:id', (req, res) => {

    const id = parseInt(req.params.id)
    return db.Log.findByPk(id)
      .then((log) => {
        if(log ===  null) return res.status(400).send("ID unknow "+id)

        log.destroy({ force: true })
    })
      .then(() => res.send({ id }))
      .catch((err) => {
        console.log('***Error deleting contact', JSON.stringify(err))
        res.status(400).send(err)
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

          const { title, description, content, heart, namespace, tag }  = req.body
          return log.update({ title, description, content, heart, namespace, tag } )
            .then(() => res.send(log))
            .catch((err) => {
              console.log('***Error updating contact', JSON.stringify(err))
              res.status(400).send(err)
            })
        })

      }

  });

  

  app.listen(7827, () => {
    console.log('Server is up on port 7827');
  });