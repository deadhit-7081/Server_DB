const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();//this declare promoRouter as mini express router and below this we can handle any promoRouter related code

promoRouter.use(bodyParser.json());

promoRouter.route('/')//we will mount this router in index.js as '/promotions'
//by using above we are declaring endpoint at one single location thereby we can chain all (get,put,post,delete) to this promo router

//chaining to promoRouter therefore no need of end point as it will be mounted from index.js
.all((req,res,next) => 
{
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    next();//next looks for additional specification downbelow which matches the end point i.e 'promotions' and passes req and res as parameter to it.
})
//chaining get to promoRouter
.get((req,res,next) =>
{
    res.end("Will send all promotions to you!")
})
.post((req,res,next) => {
    res.end('Will add the promotions :' + req.body.name+" with details :"+ req.body.description)
})
.put((req,res,next) => {
    res.statusCode = 403;//operation not supported
    res.end('PUT operation not supported on /promotions')
})
.delete((req,res,next) =>
{
    res.end("Deleating all promotions")
})

promoRouter.route('/:promold')
.all((req,res,next) => 
{
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    next();//next looks for additional specification downbelow which matches the end point i.e 'promotions' and passes req and res as parameter to it.
})
.get((req,res,next) =>
{
    res.end("Will send details of the promotions :" + req.params.promold + " to you!");
})
.post((req,res,next) => {
    res.statusCode = 403;//operation not supported
    res.end('POST operation not supported on /promotions/' + res.params.promold)
})
.put((req,res,next) => {
    res.write('Updating promotion :'+req.params.promold + '\n')//use to add line to reply message
    res.end('Will Update the promotion :'+req.body.name + 'with details :'+req.body.description)
})
.delete((req,res,next) =>
{
    res.end("Deleating promotions :"+req.params.promold)
});

//exporting dishRouter to be used in indes.js module

module.exports = promoRouter;