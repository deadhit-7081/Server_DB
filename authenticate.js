//this file stores authentication strategy

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy; 
var User = require('./models/users');

/*we are using passport mongoose plugin, the mongoose plugin itself adds this function 
called user.authenticate. So it adds this method to the user schema and the model. 
We're going to supply that as the function that will provide the authentication for 
the LocalStrategy.  */
exports.local = passport.use(new LocalStrategy(User.authenticate()));

//below two line will take care of momgoose session to track the user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());