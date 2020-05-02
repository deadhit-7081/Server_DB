const express = require('express');
const bodyParser = require('body-parser');
//using mongoose module to make connection with the server
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Comments = require('../models/comments');//requiring dishes model or schema

const commentRouter = express.Router();//this declare dishRouter as mini express router and below this we can handle any dishRouter related code

commentRouter.use(bodyParser.json());

commentRouter.route('/')
.options(cors.corsWithOptions,(req,res) =>{res.sendStatus = 200;})

//chaining get to dishRouter
.get(cors.cors,(req,res,next) =>
{
    Comments.find(req.query)
    .populate('author')
    .then((comments) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');//return in json format
        res.json(comments);//take input as string and send back to client
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
    if(res.body != null)
    {
        req.body.author = req.user._id;
        Comments.create(req.body)
        .then((comment) =>
        {
            Comments.findById(comment._id)
            .populate('author')
            .then((comment) =>
            {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(comment);
            })
        },(err) => next(err))
        .catch((err) => next(err));
    }
    else{
        err = new Error('Comment Not found on request body');
        res.statusCode = 404;
        return next(err); 
    }
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
    res.statusCode = 403;//operation not supported
    res.end('PUT operation not supported on /comments/');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) =>
{
    Comments.remove({})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(resp);
        },(err) => next(err))
        .catch((err) => next(err));
});


commentRouter.route('/:commentId')
.options(cors.corsWithOptions,(req,res) =>{res.sendStatus = 200;})
.get(cors.cors,(req,res,next) => {
    Coments.findById(req.params.commentId)
    .populate('author')
    .then((comment) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comment);

    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /comments/'+ req.params.commentId);
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Comments.findById(req.params.commentId)
    .then((comment) => {
        if (comment != null) {
            if (!comment.author.equals(req.user._id)) {
                var err = new Error('You are not authorize to update this comment!');
                err.status = 403;
                return next(err);
                dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            req.body.author = req.user._id;
            Comments.findByIdAndUpdate(req.params.commentId,{
                $set : req.body
            },{new : true})
            .then((comment) => {
                Comments.findById(comment._id)
                .populate('author')
                .then((comment) =>
                {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(comment);
                })
                
            }, (err) => next(err));
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Comments.findById(req.params.commentId)
    .then((comment) => {
        if (comment != null)
        {
            if(!comment.author.equals(req.user._id))
            {
                var err = new Error('You are not authorize to deleat this comment');
                err.status = 403;
                return next(err);
            }
            Comments.findByIdAndRemove(req.params.commentId)
            .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);                
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = commentRouter;