// Where your server and express app are being defined:
var express = require('express');
var server = express();
var models = require('./models');
var wikiRouter = require('./routes/wiki');

// ... other stuff
server.use('/wiki', wikiRouter);

models.User.sync({})
.then(function () {
    return models.Page.sync({});
})
.then(function () {
    server.listen(3001, function () {
        console.log('Server is listening on port 3001!');
    });
})
.catch(console.error);