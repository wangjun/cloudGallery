'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var router = require('./routes/routes');
var flash = require('express-flash');
var validator = require('./lib/validator');

// Connect to mongodb
var connect = function () {
    var options = {server: {socketOptions: {keepAlive: 1}}};
    mongoose.connect('mongodb://localhost/lc', options);
};
connect();
mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

//init express
var app = express();

//configuration
app.set('env', 'development');

//cookie manager
app.use(cookieParser());

//post data parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//use validator
app.use(validator);

//store session in mongodb
app.use(session({
    secret: 'JamesBegYouPleasePleasePleaseDoNotTryToBreakMySite',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

//use flash message
app.use(flash());

// view engine setup
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    noCache: true
});
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

//setting common variables for views
app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

//router
app.use('/', router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('查无此页');
    err.status = 404;
    next(err);
});

//csrf form protection
app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
    // handle CSRF token errors here
    res.status(403);
    res.send('请按正常途径填写表格。');
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err.stack
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
