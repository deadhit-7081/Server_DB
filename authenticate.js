//this file stores authentication strategy

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy; 
var User = require('./models/users');

//create the jwt(json web token strategy) which is provided by passport-jwt node module
var JwtStrategy = require('passport-jwt').Strategy;//This will provide us with a JSON Web Token based strategy for configuring our passport module

var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');//importing json web token

var config = require('./config');

/*we are using passport mongoose plugin, the mongoose plugin itself adds this function 
called user.authenticate. So it adds this method to the user schema and the model. 
We're going to supply that as the function that will provide the authentication for 
the LocalStrategy.  */
exports.local = passport.use(new LocalStrategy(User.authenticate()));

//below two line will take care of momgoose session to track the user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/*function when supply with a parameter there which I will simply call user, which will be a 
JSON object, this will create the token and give it for us. To create the token, we will be using
 the jsonwebtoken module that we just imported. So, here we'll say return JWT.sign, */
exports.getToken = function(user)
{
    return jwt.sign(user,config.secretKey,{expiresIn : 3600});//create json web token
};

//config the jwt strategy for passport
var opts = {};//options supplied for jwt strategy
//below option specifies how jwt should be extracted from incomming message
//extract JWT supports various methods for extracting information from the header
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
//supply the secreat key
opts.secretOrKey = config.secretKey;//supply the secreat key which is used in signin

/*whenever you have passport which you're configuring with a new strategy, you need to supply the 
second parameter done. Through this done parameter, you will be passing back information to 
passport which it will then use for loading things onto the request message. So, when passport 
parses the request message, it will use the strategy and then extract information, and then load 
it onto our request message.  */

//this is passport strategy 
//JwtStrategy takes two parameter 1-options 2-verify function
exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload,done) =>
{
    console.log("Jwt Payload : ",jwt_payload);
    User.findOne({_id : jwt_payload._id}, (err,user) =>
    {
        if(err)
        {
            /* This done is the callback that passport will pass into your strategy here. So, we 
            are going to be calling this done function. This done in passport takes three 
            parameters. */
            return done(err,false);
        }
        else if(user)
        {
            return done(null,user);
        }
        else{
            return done(null,false);//no user is found
        }
    });
}));

//verify incomming user
/**I will use the JWT strategy. How does the JWT strategy work? In the incoming request, the token
 *  will be included in the authentication header as we saw here. We said authentication header as
 *  bearer token. If that is included, then that'll be extracted and that will be used to 
 * authenticate the user based upon the token. */
exports.verifyUser = passport.authenticate('jwt',{session : false});

exports.verifyAdmin = (req,res,next) =>
{
    User.findOne({_id : req.user._id})
    .then((user) =>
    {
        if(req.user.admin)
        {
            next();
        }
        else {
            err = new Error('You are not authorized to perform this operation! It is restricted to admin');
            err.status = 403;
            return next(err);
        }
    },(err) => next(err))
    .catch((err) => next(err));
}
