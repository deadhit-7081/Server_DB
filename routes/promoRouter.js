const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Promotions = require('../models/promotions');

const promoRouter = express.Router();//this declare promoRouter as mini express router and below this we can handle any promoRouter related code

promoRouter.use(bodyParser.json());

promoRouter.route('/')//we will mount this router in index.js as '/promotions'
//by using above we are declaring endpoint at one single location thereby we can chain all (get,put,post,delete) to this promo router
//chaining get to promoRouter
.options(cors.corsWithOptions,(req,res) =>{res.sendStatus = 200;})

.get(cors.cors,(req,res,next) =>
{
    Promotions.find(req.query)
    .then((promo) =>
    {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promo);
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    Promotions.create(req.body)
    .then((promo) =>
    {
        console.log('Promotions Created ',promo);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promo);
    },(err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    res.statusCode = 403;//operation not supported
    res.end('PUT operation not supported on /promotions')
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>
{
    Promotions.remove({})
    .then((resp) =>
    {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err) => next(err))
    .catch((err) => next(err));
});

//promotions id
promoRouter.route('/:promoId')
.options(cors.corsWithOptions,(req,res) =>{res.sendStatus = 200;})
.get(cors.cors,(req,res,next) =>
{
    Promotions.findById(req.params.promoId)
    .then((promo) =>
    {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promo);
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    res.statusCode = 403;//operation not supported
    res.end('POST operation not supported on /promotions/' + req.params.promoId)
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    Promotions.findByIdAndUpdate(req.params.promoId,{
        $set : req.body
    },{new :true /*return the updated value as json string*/})
    .then((promo) =>
    {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promo);
    },(err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>
{
    Promotions.findOneAndRemove(req.params.promoId)
    .then((resp) =>
    {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err) => next(err))
    .catch((err) => next(err));
});

//exporting dishRouter to be used in indes.js module

module.exports = promoRouter;