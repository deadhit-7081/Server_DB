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
/* for this cookie-parser we will be using signed cookies.
 So, for this cookie-parser, supply a secret key as
 the parameter here. The secret key could be any string there
 it's just a key that can be used by our cookie-parser in order to 
 encrypt the information and sign the cookie that is sent from the server to the client. */
app.use(cookieParser('12345-67890-09876-54321'));
//Authentication Process

function auth(req,res,next)
{
  console.log(req.signedCookies);//to see what is comming from client side

  if(!req.signedCookies.user/*user is a property of signed cookies*/)//if user is not authenticated by signed cookie yet then look for authorisation header
  {
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
      var auth = new Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':');
    //auth array contains two part username and pswd
      var username = auth[0];
      var password  = auth[1];
  
    //using default value for user name and pswd
  
      if(username === 'admin' && password === 'password')
      {
        res.cookie('user' ,'admin',{signed : true});//setting up the cookie
        /*Setting up the cookied as name 'user' and value 'admin' and making it as signed cookie */
        next();//next, this means that from the auth their request will passed on the next set of middleware here and then Express will try to match the specific request to middleware which will service the request 
      }
      else{
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate','Basic');
        err.status = 401;//un-authorize user
        return next(err);
      }
  }
  else//if user already exists
  {
    if(req.signedCookies.user === 'admin')
    {
      next();
    }
    else{
      var err = new Error('You are not authenticated!');
      err.status = 401;//un-authorize user
      return next(err);
    }
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