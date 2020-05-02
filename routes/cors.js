const express = require('express');
const cors = require('cors');
const app = express();

//whitelist contains all the origin which this server is willing to accept
const whitelist = ['http://localhost:3000','https://localhost:3443','http://LAPTOP-GVIONNTJ:3001'];
var corsOptionsDelegate = (req,callback) =>
{
    var corsOptions;
    /**if the incoming request header contains an origin feild, then we are going to check this 
     * whitelist. Looking for that particular origin, is it present in this whitelist. Index of 
     * operation will return the index greater than or equal to zero if this is present in this 
     * array. It'll return -1 if this is not present in this array. */
    if(whitelist.indexOf(req.header('Origin')) !== -1)
    {
        /** { origin: true}, meaning that the original origin in the incoming request is in the 
         * whitelist. So I will allow it to be accepted.Then my cors Module will reply back 
         * saying access control allow origin, and then include that origin into the headers with 
         * the access control allow origin key there. */
        corsOptions = {origin : true};
    }
    else{
        /**if the req.header's(' Origin') is not in the whitelist, then you will see corsOptions.
        { origin: false}. So when you set origin to false, then the access controller allowOrigin
         will not be returned by my server site. */
        corsOptions = {origin : false};
    }
    callback(null,corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);