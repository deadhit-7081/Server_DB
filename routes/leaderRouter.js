const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
.all((req,res,next) => 
{
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    next();
})
.get((req,res,next) =>
{
    res.end("Will send all leader to you!")
})
.post((req,res,next) => {
    res.end('Will add the leaders :' + req.body.name+" with details :"+ req.body.description)
})
.put((req,res,next) => {
    res.statusCode = 403;//operation not supported
    res.end('PUT operation not supported on /leaders')
})
.delete((req,res,next) =>
{
    res.end("Deleating all leders")
})

leaderRouter.route('/:leaderld')
.all((req,res,next) => 
{
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    next();
})
.get((req,res,next) =>
{
    res.end("Will send details of the leaders :" + req.params.leaderld + " to you!");
})
.post((req,res,next) => {
    res.statusCode = 403;//operation not supported
    res.end('POST operation not supported on /leaders/' + res.params.leaderld)
})
.put((req,res,next) => {
    res.write('Updating leaders :'+req.params.leaderld + '\n')
    res.end('Will Update the leaders :'+req.body.name + 'with details :'+req.body.description)
})
.delete((req,res,next) =>
{
    res.end("Deleating leaders :"+req.params.leaderld)
});

//exporting dishRouter to be used in indes.js module

module.exports = leaderRouter;