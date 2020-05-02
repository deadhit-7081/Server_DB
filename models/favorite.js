const mongoose = require('mongoose');
const schema = mongoose.Schema;

const diSchema = new Schema({
    dish :
    {
        type :mongoose.Schema.Types.ObjectId,
        ref :'Dish'
    }
});

//creatng favorite Schema
const favoriteSchema = new Schema({
    user :
    {
        type : mongoose.Schema.Types.ObjectId,
        ref :'User'
    },
    dishes : [diSchema]
},{
    timestamps : true
});

var Favorite = mongoose.model('Favorite',favoriteSchema);

module.exports = Favorite;