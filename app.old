
let express = require('express'),
 app = express(),
 router = express.Router(),
 http = require('http'),
 path = require('path'),
 bodyParser = require('body-parser'),
 mongoose = require('mongoose'),
  connStr = 'mongodb://localhost/uspddtest';

 require('./models/Question');
 require('./models/Answer');
 require('./models/Test');

const testRoute = require('./controllers/test.controller');
testRoute.controller(app);
const editRoute = require('./controllers/edit.controller');
editRoute.controller(app);

app.set('port', process.env.PORT || 3000);

mongoose.connect(connStr);
const db = mongoose.connection;

db.on('connected',  () => {
  console.log("Sucessfully connected to db..");
});

 //router to handle any other page request 
 app.route('*').all((req,res,next)=>{
  res.statusCode = 404;
  console.log("path not found: " + JSON.stringify(req.params));
  next();
})

app.use('/api/v1', router);

const server = http.createServer(app);
server.listen(app.get('port'),(req,res)=>{
	console.log('App listening to port'+app.get('port'));
});
