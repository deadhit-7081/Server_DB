var express = require('express');
const bodyParser = require('body-Parser');
var User = require('../models/users');
var passport = require('passport');
var authenticate = require('../authenticate');

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


  /* checking the user with same user name */
  User.register(new User({username  : req.body.username}),req.body.password,(err,user) =>
  {
    if(err)//handling error
    {
      res.statusCode = 500;
      res.setHeader('Content-Type','application/json');
      res.json({err : err});/**construct a json object with the error as the value for the error property in there and then send this back */
    }
    else{
        if(req.body.firstname)
        {
          user.firstname = req.body.firstname;
        }
        if(req.body.lastname)
        {
          user.lastname = req.body.lastname;
        }
        user.save((err,user) =>
        {
          if(err)
          {
            res.statusCode = 500;
            res.setHeader('Content-Type','application/json');
            res.json({err : err});
            return ;
          }
          passport.authenticate('local')(req,res,()=>
          {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json({success : true,status : 'Registration Successfull!'});
          });
        });
    }
  });
});

//login the user(using express sessions)
/*If this is successful then this will come in and the next function that follows will be 
executed. If there is any error in the authentication, this passport authenticate local will 
automatically send back a reply to the client about the failure of the authentication.  */
router.post('/login',passport.authenticate('local'),(req,res,next) =>
{

  //create a token
  var token = authenticate.getToken({_id : req.user._id});//once the token is created pass the token back to user
  res.statusCode = 200;
  res.setHeader('Content-Type','application/json');
  res.json({success : true, token : token ,status : 'You are successfully logged in!'});
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
