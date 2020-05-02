var express = require('express');
const bodyParser = require('body-Parser');
var User = require('../models/users');
var passport = require('passport');
var authenticate = require('../authenticate');
var cors = require('./cors');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
/**outer.options field here, because sometimes a post request as you saw with the login will send
 *  the options first to check, especially with cars, whether the post request will be allowed. */
router.options('*',cors.corsWithOptions,(req,res) => {res.sendStatus(200);})
router.get('/',cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, function(req, res, next) {
  User.find({})
  .then((user) =>
  {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(user);
  }, (err) => next(err))
  .catch((err) => next(err));
});

//this signup route will allow a user to signup on the system
router.post('/signup',cors.corsWithOptions,(req,res,next) =>//sign new user within the system
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
router.post('/login',cors.corsWithOptions,(req,res,next) =>
{
  /** the error will be returned when there is a genuine error that occurs during the 
   * authentication process, but the info will contain information if the user doesn't exist. So,
   *  the passport.authenticate is passing back a message saying that the user doesn't exist or 
   * either the username is incorrect or the password is incorrect and so on.  */
  passport.authenticate('local',(err,user,info) =>
  {
    if(err)
    {
      return next(err);
    }
    if(!user)
    {
      res.statusCode = 401;
      res.setHeader('Content-Type','application/json');
      res.json({success : false,status : 'Log in Unsuccessful!',err : info});
    }
    /** if this is successful, the passport.authenticate we'll add this method called req.logIn 
     * to the user. So, at this point, we will just simply pass in the user object that we've 
     * obtained. */
    req.logIn(user,(err) =>{
      if(err)
      {
        res.statusCode = 401;
        res.setHeader('Content-Type','application/json');
        res.json({success : false,status : 'Log in Unsuccessful!',err : 'Could not log in user'}); 
      }
    
    var token = authenticate.getToken({_id : req.user._id});//once the token is created pass the token back to user
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json({success : true,status : 'Log in Successful!',token : token});
  });
  })(req,res,next);
});

//logging out the user
router.get('/logout',cors.corsWithOptions,(req,res,next) =>
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
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

router.get('/facebook/token',passport.authenticate('facebook-token'),(req,res) =>
{
  if(req.user)
  {
    //creating json web token for the user logged in
    var token = authenticate.getToken({_id:req.user._id}); 
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json({success : true, token : token ,status : 'You are successfully logged in!'});
  }
});

/**if you do a get to the checkJWTToken by including the token into the authorization header, 
 * then this call will return a true or false to indicate to you whether the JSON Web Token is 
 * still valid or not. If it is not valid, then the client-side can initiate another login for 
 * the user to obtain a new JSON Web Token if required. */
router.get('/checkJWTToken',cors.corsWithOptions,(req,res) =>
{
  passport.authenticate('jwt',{session : false},(err,user,info) =>
  {
    if(err)
    {
      return next(err);
    }
    if(!user)
    {
      res.statusCode = 401;
      res.setHeader('Content-Type','application/json');
      return res.json({status : 'JWT INVALID',success : false, err: info})
    }
    else{
      res.statusCode = 200;
      res.setHeader('Content-Type','application/json');
      return res.json({status : 'JWT VALID',success : true, user : user})
    }
  })(req,res);
});

module.exports = router;
