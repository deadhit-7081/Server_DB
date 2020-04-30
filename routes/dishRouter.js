
const express = require('express');
const bodyParser = require('body-parser');
//using mongoose module to make connection with the server
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');//requiring dishes model or schema

const dishRouter = express.Router();//this declare dishRouter as mini express router and below this we can handle any dishRouter related code

dishRouter.use(bodyParser.json());

dishRouter.route('/')//we will mount this router in index.js as '/dishes'
//by using above we are declaring endpoint at one single location thereby we can chain all (get,put,post,delete) to this dish router

//chaining get to dishRouter
.get((req,res,next) =>
{
    Dishes.find({})
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
.post(authenticate.verifyUser ,authenticate.verifyAdmin, (req,res,next) => {
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
.put(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    res.statusCode = 403;//operation not supported
    res.end('PUT operation not supported on /dishes')
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>
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

.get((req,res,next) =>
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
.post(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    res.statusCode = 403;//operation not supported
    res.end('POST operation not supported on /dishes/' + req.params.dishId)
})
.put(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
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
.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>
{
    Dishes.findOneAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');//return in json format
        res.json(resp);//take input as string and send back to client
    },(err) => next(err))
    .catch((err) => next(err));
});


//Editing and useing rest API in subdocument of dishes i.e comments

dishRouter.route('/:dishId/comments')//we will mount this router in index.js as '/dishes'
//by using above we are declaring endpoint at one single location thereby we can chain all (get,put,post,delete) to this dish router

//chaining get to dishRouter
.get((req,res,next) =>
{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if(dish != null)
        {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');//return in json format
            res.json(dish.comments);//take input as string and send back to client
        }
        else{
            err = new Error('Dish '+ req.params.dishId+' not found!');//creating new error object
            err.status = 404;
            return next(err);//returning error to the app.js global error handler 
        }
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,(req,res,next) => {
    Dishes.findById(req.params.dishId) 
    .then((dish) =>
    {
        if(dish != null)
        {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save()//if save returned successfully then below line will execute
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('commnets.author')
                .then((dish) =>
                {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');//return in json format
                    res.json(dish);//take input as string and send back to client
                })
            }, (err) => next(err));
        }
        else{
            err = new Error('Dish '+ req.params.dishId+' not found!');//creating new error object
            err.status = 404;
            return next(err);//returning error to the app.js global error handler 
        }
    },(err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser,(req,res,next) => {
    res.statusCode = 403;//operation not supported
    res.end('PUT operation not supported on /dishes '+req.params.dishId+' /comments');
})
.delete(authenticate.verifyUser,(req,res,next) =>
{
    Dishes.findById(req.params.dishId)
        .then((dish) => {
            if(dish != null)
            {
                for(var i = (dish.comments.length -1); i>=0; i--) 
                {
                    dish.comments.id(dish.comments[i]._id).remove();
                }
                dish.save()//if save returned successfully then below line will execute
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');//return in json format
                    res.json(dish);//take input as string and send back to client
                },(err) => next(err));
            }
            else{
                err = new Error('Dish '+ req.params.dishId+' not found!');//creating new error object
                err.status = 404;
                return next(err);
            }
               
        },(err) => next(err))
        .catch((err) => next(err));
});
dishRouter.route('/:dishId/comments/:commentId')
.get((req,res,next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId
        + '/comments/' + req.params.commentId);
})
.put(authenticate.verifyUser,(req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            if (req.body.rating) {
                dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                dish.comments.id(req.params.commentId).comment = req.body.comment;                
            }
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) =>
                {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);
                })
                
            }, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser,(req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null
         && dish.comments.id(req.params.commentId).author === (req.user._id)) {
            dish.comments.id(req.params.commentId).remove();
            dish.save() 
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);                
            }, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});



//exporting dishRouter to be used in indes.js module
module.exports = dishRouter;