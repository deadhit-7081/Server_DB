var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');//requiring mongoose to connect to database

const Dishes = require('./models/dishes');//aquiring dishes which contains the schema or structure of dishes
const url = 'mongodb://localhost:27017/conFusion';//connecting to server
const connect = mongoose.connect(url);

connect.then((db) =>
{
  console.log('Connected correctly to server');
},(err) => { console.log(err); });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//Authentication Process

function auth(req,res,next)
{
  console.log(req.headers);//to see what is comming from client side

  var authHeader = req.headers.authorization;//getting hold of authorization header
  if(!authHeader)//if authHeader is null the we challenge the client
  {
    var err = new Error('You are not authenticated!');
    res.setHeader('WWW-Authenticate','Basic');
    err.status = 401;//un-authorize user
    return next(err);//directly jumps to error handler and sends reply message back to client
  }

  //authHeader is string so we split the value and give encoding of buffer i.e base64
/*[1] in below code means spliting the array into 2 parts ,1st contains basic and 2nd containf
 username and pswd in base64 encoding formate*/
 /*After we obtain username and pswd from second part if array and then we convert it into string
  which is of formate username:pswd ,therefore we are again splitting it by colen to get seperate 
  username and pswd*/
  var auth = new Buffer(authHeader.split(' ')[1],'base64').toString().split(':');
  //auth array contains two part username and pswd
  var username = auth[0];
  var password  = auth[1];

  //using default value for user name and pswd

  if(username === 'admin' && password === 'password')
  {
    next();//next, this means that from the auth their request will passed on the next set of middleware here and then Express will try to match the specific request to middleware which will service the request 
  }
  else{
    var err = new Error('You are not authenticated!');
    res.setHeader('WWW-Authenticate','Basic');
    err.status = 401;//un-authorize user
    return next(err);
  }
}
app.use(auth);//auth function which is added

app.use(express.static(path.join(__dirname, 'public')));//enable us to serve static data to public folder

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler * global handler of errors
app.use(function(req, res, next) {
  next(createError(404));
});

//global error handler
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
