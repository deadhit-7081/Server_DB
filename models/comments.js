const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//creatind commentSchema
const commentSchema = new Schema({
    rating:{
        type : Number,
        min : 1,
        max : 5,
        required : true
    },
    comment : {
        type : String,
        required : true
    },

    //we can populate this into dishes when required
    author :{
        type : mongoose.Schema.Types.ObjectId,//reference to user document
        ref : 'User'//reference to user model
    },
    dish :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Dishes'
    }
},{
    timestamps : true //automatically include time stamp of when it created and last updated
});

var Comments = mongoose.model('Comment',commentSchema);

module.exports = Comments;