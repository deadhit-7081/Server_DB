const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

//creating promo schema

const promoSchema = new Schema({
    name : {
        type :String,
        require:true,
        unique : true
    },
    image : {
        type : String,
        require : true
    },
    label : {
        type : String,
        require :true
    },
    price : {
        type : Currency,
        require : true,
        min : 0
    },
    description : {
        type : String,
        require: true
    },
    featured :{
        type : Boolean,
        default : false
    }
});

var Promotions = mongoose.model('Promotion',promoSchema);

module.exports = Promotions;