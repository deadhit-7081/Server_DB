var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');//requiring mongoose to connect to database

const Dishes = require('./models/dishes');//aquiring dishes which contains the schema or structure of dishes
const url = config.mongoUrl;//url of server
const connect = mongoose.connect(url);//establishing connection to the server

connect.then((db) =>
{
  console.log('Connected correctly to server');
},(err) => { console.log(err); });

var app = express();

//for all the request comming in we redirect the request to the secure server port

app.all('*',(req,res,next) =>
{
  if(req.secure)//if incomming request is already secure request i.e at secure server port then the secure property in request is already set tp true
  {
    return next();//transfer to next middleware to handle it
  }
  else{
    /** 307 here represents that the target resource resides temporarily under different URL.
     *  And the user agent must not change the request method if it reforms in automatic 
     * redirection to that URL. So, I'll be expecting user agent to retry with the same method 
     * that they have used for the original end point. */
    res.redirect(307, 'https://'+req.hostname+':'+app.get('secPort') + req.url);//req.url contains rest path except host name
  }
});

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
//app.use(cookieParser('12345-67890-09876-54321'));



app.use(passport.initialize());
/*If the user is logged in, then what happens is that when the session is initiated again, you
 recall that when you log in here, you will be logging in here, and a call to the passport
  authenticate local, when this is done at the login stage, the passport authenticate local will 
  automatically add the user property to the request message. So, it'll add req.user and then, 
  the passport session that we have done here will automatically serialize that user information
   and then store it in the session. So, and subsequently, whenever a incoming request comes in 
   from the client side with the session cookie already in place, then this will automatically 
   load the req.user onto the incoming request. So, that is how the passport session itself is 
   organized.  */

app.use('/', indexRouter);
app.use('/users', usersRouter);



app.use(express.static(path.join(__dirname, 'public')));//enable us to serve static data to public folder

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