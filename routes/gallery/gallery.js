var express = require('express');
var router = express.Router();
var upload = require('./upload');
var bodyParser = require('body-parser');
var csrf = require('csurf');

//csrf protection
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

router.use('/upload', upload);

router.get('/add-album', csrfProtection, function (req, res) {
    res.render('gallery/add-album.html',{
        csrfToken:req.csrfToken()
    });
});

router.post('/add-album', parseForm, csrfProtection, function (req, res) {
    var title = req.body.title;
    var story = req.body.story;
});

module.exports = router;