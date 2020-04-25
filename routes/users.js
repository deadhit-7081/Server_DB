var express = require('express');
const bodyParser = require('body-Parser');
var User = require('../models/users');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//this signup route will allow a user to signup on the system
router.post('/signup',(req,res,next) =>//sign new user within the system
{
  /* user method and the expectation is that for a user to sign up, the username 
  and password will be provided as a JSON string inside the body of the incoming 
  post request. So, from the body, since the body would have been already parsed
  by the body parser, so from the body, will first check to make sure that the
  user with that username doesn't exist within the system. If the user with 
  that username exist, then you are trying to sign up a duplicate user and that should 
  not be allowed in the system.  */
  User.findOne({username  : req.body.username})//checking the user with same user name
  .then((user) => 
  {
    if(user != null)//if user exist with the user name
    {
       var err = new Error('User '+req.body.username+' already exists!');
       err.status = 403;//forbidden
       next(err);//calling the error handler
    }
    else{
      //letting new user to be signed up and return promise
      return User.create({username : req.body.username,password : req.body.password});
    }
  })
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json({status : 'Registration Successfull!', user : user});
  },(err) => next(err))//if error in registration then call error handler
  .catch((err) => next(err));
});

//login the user(using express sessions)
router.post('/login',(req,res,next) =>
{
  if(!req.session.user/*user is a property of signed cookies*/)//if user is not authenticated by signed cookie yet then look for authorisation header
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
  
    //searching the user in the data base
    User.findOne({username : username})
    .then((user) =>{
      if(user === null)//we coudn't find user with particular user name
      {
        var err = new Error('User '+username+' does not exists!');
        err.status = 403;
        return next(err);
      }
      else if(user.password !== password)
      {
        var err = new Error('Your Password is incorrect');
        err.status = 401;//un-authorize user
        return next(err);
      }
      else if(user.username === username && user.password === password)
      {
        req.session.user = 'authenticated';//setting user property on req session to user
        res.statusCode = 200;
        res.setHeader('Content-Type','text/plain');
        res.end('You are Authenticated!');
      }
    })
    .catch((err) => next(err));
  }
  else//user is already logged in earlier
  {
    res.statusCode = 200;
    res.setHeader('Content-Type','text/plain');
    res.end('You are already authenticated!');
  }
});

//logging out the user
router.get('/logout',(req,res,next) =>
{
  if(req.session)//if session exists i.e user is logged in
  {
    //destroying session server side
    req.session.destroy();/* session itself provides this method called destroy and when 
    you call the destroy method, the session is destroyed and the information is removed 
    from the server side pertaining to this session. So, which means that if the client
     tries to again send the session information which is stored in the form of a signed 
     cookie on the client side, that will be invalid. */
     res.clearCookie('session-id');//asking user to deleat cookie from client side
     res.redirect('/');//redirecting the user to standard page i.e Home page
  }
  else{
    var err = new Error('You are not loggrd in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
