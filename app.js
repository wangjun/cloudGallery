'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var swig = require('swig');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var routes = require('./routes/index');
var users = require('./routes/users');
var articles = require('./routes/articles');
var utility = require('./routes/utility');
var admin = require('./routes/admin/admin');
var cdn = require('./routes/cdn/cdn');
var gallery = require('./routes/gallery/gallery');
var nodedump = require('nodedump').dump;
var flash = require('express-flash');
var expressValidator = require('express-validator');


// Connect to mongodb
var connect = function () {
    var options = { server: { socketOptions: { keepAlive: 1 } } };
    mongoose.connect('mongodb://localhost/lc', options);
};
connect();

mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

var app = express();

//configuration
app.set('env','development');
//store session in mongodb
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(session({
    secret: 'JamesBegYouPleasePleasePleaseDoNotTryToBreakMySite',
    resave:true,
    saveUninitialized:true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(flash());

// view engine setup
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Swig will cache templates for you, but you can disable
// that and use Express's caching instead, if you like:
app.set('view cache', false);
// To disable Swig's cache, do the following:
swig.setDefaults({ cache: false });

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

//setting common variables for views
app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/articles', articles);
app.use('/utility', utility);
app.use('/cdn', cdn);
app.use('/gallery', gallery);
app.use('/admin', function (req, res, next) {
    if(req.session.user.type == 'admin'){
        next();
    }else{
        req.flash('danger', '请勿尝试访问该路径！');
        res.redirect('/');
    }
}, admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('查无此页');
  err.status = 404;
  next(err);
});

//csrf form protection
app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)
    // handle CSRF token errors here
    res.status(403);
    res.send('请按正常途径填写表格。')
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err.stack
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
