const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//Articles Model
const Article = require('../models/articles');
//User Model
const User = require('../models/user');

//home route
router.get('/', function(req, res){
    Article.find({}, function(err, articles){
        if(err){
            console.log(err);
        } else{
            res.render('articles/index', {
                title: 'Articles',
                articles: articles
            });
        }
    });
});

// Get Add Articles Page
router.get('/add', ensureAuthenticated, function(req, res, next){
    res.render('articles/add_article', {
        title: 'Add Article'
    });
});

// Add articles post request
router.post('/add', function(req, res, next){
    req.checkBody('title','Title is required').notEmpty();
    //req.checkBody('author','Author is required').notEmpty();
    req.checkBody('body','Body is required').notEmpty();

    //get errors
    const errors = req.validationErrors();

    if(errors){
        res.render('articles/add_article',{
            title: 'Add Article',
            errors:errors
        });
    }else{
        const article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save(function(err){
            if(err){
                console.log(err);
            } else{
                req.flash('success','Article Added');
                res.redirect('/articles');
            }
        });
    }
});

// Get Single article
router.get('/:id', function(req, res, next){
    Article.findById(req.params.id, function(err, article){
        User.findById(article.author, function(err, user){
            res.render('articles/article', {
                article: article,
                author: user.firstName + ' ' + user.lastName
            });
        });
    });
});

// Load edit form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
    Article.findById(req.params.id, function(err, article){
        if(article.author != req.user._id){
            req.flash('danger','Not Authorized');
            res.redirect('/');
        }
        res.render('articles/edit_article', {
            title:'Edit Article',
            article: article
        });
    });
});

// Update articles post request
router.post('/edit/:id', function(req, res, next){
    const article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    const query = {_id:req.params.id};

    Article.update(query, article, function(err){
        if(err){
            console.log(err);
        } else{
            req.flash('success','Article Updated');
            res.redirect('/articles');
        }
    });
});

//Delete article
router.delete('/:id', function(req, res){
    if(!req.user._id){
        res.status(500).send();
    }

    const query = {_id:req.params.id}

    Article.findById(req.params.id, function(err, article){
        if(article.author != req.user._id){
            res.status(500).send();
        } else {
            Article.remove(query, function(err){
                if(err){
                    console.log(err);
                }
                res.send('Success');
            });
        }
    });
});

//Access Control
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;