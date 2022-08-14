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


const PORT = process.env.PORT || 8080;
//7827
//const PORT = 7827

server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
