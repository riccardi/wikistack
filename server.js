// Where your server and express app are being defined:
var express = require('express');
var server = express();
var models = require('./models');
var wikiRouter = require('./routes/wiki');
var swig = require('swig');
var bodyParser = require('body-parser');

// ... other stuff
server.use(bodyParser.urlencoded({ extended: false }));
server.use('/wiki', wikiRouter);
server.use(express.static("public"));
server.engine('html', swig.renderFile);
server.set('view engine', 'html');
server.set('views', __dirname + '/views');
swig.setDefaults({ cache: false });


models.User.sync({  })
.then(function () {
    return models.Page.sync({  });
})
.then(function () {
    server.listen(3001, function () {
        //console.log('Server is listening on port 3001!');
    });
})
.catch(console.error);