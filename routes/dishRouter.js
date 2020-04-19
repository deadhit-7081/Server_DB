const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();//this declare dishRouter as mini express router and below this we can handle any dishRouter related code

dishRouter.use(bodyParser.json());

dishRouter.route('/')//we will mount this router in index.js as '/dishes'
//by using above we are declaring endpoint at one single location thereby we can chain all (get,put,post,delete) to this dish router

//chaining to dishRouter therefore no need of end point as it will be mounted from index.js
.all((req,res,next) => 
{
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    next();//next looks for additional specification downbelow which matches the end point i.e 'dishes' and passes req and res as parameter to it.
})
//chaining get to dishRouter
.get((req,res,next) =>
{
    res.end("Will send all dishes to you!")
})
.post((req,res,next) => {
    res.end('Will add the dish :' + req.body.name+" with details :"+ req.body.description)
})
.put((req,res,next) => {
    res.statusCode = 403;//operation not supported
    res.end('PUT operation not supported on /dishes')
})
.delete((req,res,next) =>
{
    res.end("Deleating all dishes")
})

dishRouter.route('/:dishId')// mount this router in index.js as '/dishes/:dishId'
.all((req,res,next) => 
{
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    next();//next looks for additional specification downbelow which matches the end point i.e 'dishes' and passes req and res as parameter to it.
})
.get((req,res,next) =>
{
    res.end("Will send details of the dish :" + req.params.dishId + " to you!");
})
.post((req,res,next) => {
    res.statusCode = 403;//operation not supported
    res.end('POST operation not supported on /dishes/' + res.params.dishId)
})
.put((req,res,next) => {
    res.write('Updating dish :'+req.params.dishId + '\n')//use to add line to reply message
    res.end('Will Update the dish :'+req.body.name + 'with details :'+req.body.description)
})
.delete((req,res,next) =>
{
    res.end("Deleating dish :"+req.params.dishId)
});

//exporting dishRouter to be used in indes.js module

module.exports = dishRouter;