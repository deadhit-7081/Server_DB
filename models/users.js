//setting schema for user

var mongoose  = require('mongoose');
var Schema = mongoose.Schema;
//acquiring passport local mongoose 
//this will automatically handle username and password and convert paswd into hash value using salt
//adds additional method to user Schema and model which is nessary for user authentication

var passportLocalMongoose = require('passport-local-mongoose');
var User = new Schema({

    firstname : {
        type : String,
        default : ''
    },
    lastname: {
        type : String,
        default : ''
    },

    //facebookId stores the facebook Id of the user who is logging in
    facebookId : String,
    //admin to test wether user is admin or normal user
    admin : {
        type : Boolean,
        default : false
    }
});

//to use passport as plugin in user model and user Schema
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',User);