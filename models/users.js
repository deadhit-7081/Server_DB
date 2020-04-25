//setting schema for user

var mongoose  = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    username : {
        type : String,
        require : true,
        unique : true
    },
    password : {
        type : String,
        require : true
    },
    //admin to test wether user is admin or normal user
    admin : {
        type : Boolean,
        default : false
    }
});

module.exports = mongoose.model('User',User);