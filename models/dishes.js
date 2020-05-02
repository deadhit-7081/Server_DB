const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//requiring mongoose currency
require('mongoose-currency').loadType(mongoose);//loads the currency type into mongoose

const Currency = mongoose.Types.Currency;//currency type is added into mongoose so to use in defing the schema


//create dishSchema
const dishSchema = new Schema({
    name :{
        type : String,
        require : true,
        unique : true
    },
    description : {
        type : String,
        require : true
    },
    image : {
        type : String,
        require : true
    },
    category : {
        type : String,
        default : ''
    },
    label : {
        type : String,
        require : true
    },
    price : {
        type : Currency,//currency type usage
        required : true,
        min : 0
    },
    featured : {
        type :Boolean,
        default : false
    }
},{
    timestamps : true //automatically include time stamp of when it created and last updated
});

//constructing model
var Dishes = mongoose.model('Dish',dishSchema);

module.exports = Dishes;
