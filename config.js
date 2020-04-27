//use it to store some configuration information for our server. 
//Now, this is a way of centralizing all the configuration for our server.

//expotring json object
module.exports = {
    'secretKey':'12345-67890-09876-54321',//secret key used in signing web token
    'mongoUrl':  'mongodb://localhost:27017/conFusion' //url for mongodb server
}