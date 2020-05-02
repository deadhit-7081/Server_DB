
const express = require('express');
const bodyParser = require('body-parser');
//using mongoose module to make connection with the server
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Dishes = require('../models/dishes');//requiring dishes model or schema

const dishRouter = express.Router();//this declare dishRouter as mini express router and below this we can handle any dishRouter related code

dishRouter.use(bodyParser.json());

dishRouter.route('/')//we will mount this router in index.js as '/dishes'
//by using above we are declaring endpoint at one single location thereby we can chain all (get,put,post,delete) to this dish router

.options(cors.corsWithOptions,(req,res) =>{res.sendStatus = 200;})

//chaining get to dishRouter
.get(cors.cors,(req,res,next) =>
{
    Dishes.find(req.query)
    /**when the dishes document has been constructed to send back the reply to the user, we're 
     * going to populate the author field inside there from the user document in there. So, this 
     * call to the populate will ensure that the other field will be populated with the 
     * information as required.  */
    .populate('comments.author')
    .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');//return in json format
        res.json(dishes);//take input as string and send back to client
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser ,authenticate.verifyAdmin, (req,res,next) => {
    Dishes.create(req.body)//body parser would have already parsed whatever is in the body of the message and loaded it onto the body property of the request. So, I'm just going to take the request body and then parse it in as a parameter to my dishes.create method and handle the return value. 
    .then((dish) =>
    {
        console.log('Dish Created' , dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');//return in json format
        res.json(dish);//take input as string and send back to client
    },(err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    res.statusCode = 403;//operation not supported
    res.end('PUT operation not supported on /dishes')
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>
{
    Dishes.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');//return in json format
        res.json(resp);//take input as string and send back to client
    },(err) => next(err))
    .catch((err) => next(err));
})

dishRouter.route('/:dishId')// mount this router in index.js as '/dishes/:dishId'
.options(cors.corsWithOptions,(req,res) =>{res.sendStatus = 200;})

.get(cors.cors,(req,res,next) =>
{
    Dishes.findById(req.params.dishId)//we already know that the dish ID is present in the params property.
    .populate('comments.author')
    .then((dish) =>
    {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');//return in json format
        res.json(dish);//take input as string and send back to client
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    res.statusCode = 403;//operation not supported
    res.end('POST operation not supported on /dishes/' + req.params.dishId)
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    Dishes.findByIdAndUpdate(req.params.dishId,{ 
        $set :req.body
    },{new :true /*return the updated value as json string*/})
    .then((dish) =>
    {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');//return in json format
        res.json(dish);//take input as string and send back to client
    },(err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>
{
    Dishes.findOneAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');//return in json format
        res.json(resp);//take input as string and send back to client
    },(err) => next(err))
    .catch((err) => next(err));
});


//exporting dishRouter to be used in indes.js module
module.exports = dishRouter;