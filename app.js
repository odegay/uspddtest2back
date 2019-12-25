const express = require('express');
const bodyParser = require('body-parser');
// const router = new express.Router();
// const http = require('http');
// const path = require('path');
// const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const connStr = 'mongodb://localhost/uspddtest';
require('./models/Question');
require('./models/Translation');
require('./models/Answer');
require('./models/Test');
const testRouter = require('./routes/test_routes');
const editRouter = require('./routes/edit_routes');
const logger = require('morgan');

const app = express();

// app.set('port', process.env.PORT || 3000);

mongoose.connect(connStr);
const db = mongoose.connection;
db.on('connected', () => {
  console.log('Sucessfully connected to db..');
});
app.use(bodyParser.json());
app.use(logger('dev'));
// app.use('/api/v1', router);
app.use('/api/edit', editRouter);
app.use('/api/test', testRouter);

// router to handle any other page request
app.route('*').all((req, res, next)=>{
  res.statusCode = 404;
  console.log('path not found: ' + JSON.stringify(req.params));
  next();
});

app.listen(3000);
// module.exports = app;
/*
const server = http.createServer(app);
server.listen(app.get('port'), (req, res)=>{
  console.log('App listening to port'+app.get('port'));
})/;
*/
