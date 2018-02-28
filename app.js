const express = require('express');
const BodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database);
const db = mongoose.connection;

//check connection
db.once('open', function(){
    console.log('Connected to MongoDB');
});

//check for DB errors
db.on('error', function(err){
    console.log(err);
});

//init app
const app = express();

//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Body parser
app.use(BodyParser.urlencoded({ extended: false }));
app.use(BodyParser.json());

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//Express Session Midlleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true }
}));

//Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift + ']';
        }
        return{
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

//Passport Config
require('./config/passport')(passport);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
});

//start server
const port = 5000;
app.listen(port, function(){
    console.log('Server start on port', port)
});

//Routes
const articlesRoutes = require('./routes/articles');
const usersRoutes = require('./routes/users');
app.use('/articles', articlesRoutes);
app.use('/users', usersRoutes);