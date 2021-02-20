const express = require('express');
const bodyParser = require('body-parser');
const db = require('../models'); // new require for db object
const path = require('path')
const Joi = require('joi')

const app = express();

app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, '../public')));

app.get('/api/logs', (req, res) => {
    return db.Log.findAll()
      .then((logs) => res.send(logs))
      .catch((err) => {
        console.log('There was an error querying logs', JSON.stringify(err))
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

          const { title, content, heart, namespace, tag }  = req.body
          return log.update({ title, content, heart, namespace, tag } )
            .then(() => res.send(log))
            .catch((err) => {
              console.log('***Error updating contact', JSON.stringify(err))
              res.status(400).send(err)
            })
        })

      }

  });

  

  app.listen(3000, () => {
    console.log('Server is up on port 3000');
  });