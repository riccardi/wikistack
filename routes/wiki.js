var express = require('express');
var router = express.Router();
var Promise = require('bluebird');

var models = require('../models');
var Page = models.Page;
var User = models.User;

router.get('/', function(req, res, next) {
    var query = req.query.tag;
    if(query === undefined) {
	    Page.findAll().then(function(allPages) {
	        res.render('index', { pages: allPages });
	    });
	} else {
		Page.findByTag(query).then(function (pages) {
    		 res.render('index', { pages: pages });
		});
	}
});

router.post('/', function(req, res, next) {
    // res.send('got to POST /wiki/');
    var title = req.body.title;
    var content = req.body.content;
    var name = req.body.name;
    var email = req.body.email;
    var status = req.body.status;
    var tags = req.body.tags;

    User.findOrCreate({
            where: {
                name: req.body.name,
                email: req.body.email
            }
        })
        .then(function(values) {

            var user = values[0];

            var page = Page.build({
                title: title,
                content: content,
                tags: tags,
                status: status
            });

            page.save().then(function(page) {
                return page.setAuthor(user);
            });

        })
        .then(function(page) {
            res.redirect(page.route);
        })
        .catch(next);


});

router.get('/tags', function(req, res, next) {
	var query = req.query.tag;
	Page.findByTag(query).then(function (pages) {
    		 res.render('index', { pages: pages });
	});
});

router.get('/search', function(req, res, next) {
	res.render('search');
});

router.get('/users', function(req, res, next) {
  User.findAll({}).then(function(users){
    res.render('users', { users: users });
  }).catch(next);
});

router.get('/users/:userId', function(req, res, next) {

  var userPromise = User.findById(req.params.userId);
  var pagesPromise = Page.findAll({
    where: {
      authorId: req.params.userId
    }
  });

  Promise.all([
    userPromise, 
    pagesPromise
  ])
  .then(function(values) {
    var user = values[0];
    var pages = values[1];
    res.render('user', { user: user, pages: pages });
  })
  .catch(next);

});

router.get('/add', function(req, res, next) {
    //res.send('got to GET /wiki/add');
    res.render('addpage');
});

router.get('/:urlTitle', function(req, res, next) {

    Page.findOne({
            where: {
                urlTitle: req.params.urlTitle,
            },
            include: [ {model: User, as: 'author'} ] 
        })
        .then(function(foundPage) {
         	console.log("this is what we want", foundPage.author.name);
            res.render('wikipage', { title: foundPage.title, content: foundPage.content, tags:foundPage.tags, name: foundPage.author.name, author_id: foundPage.author.id });
        })
        .catch(next);

});



module.exports = router;
