var express = require('express');
var router = express.Router();
var upload = require('./upload');
var bodyParser = require('body-parser');
var csrf = require('csurf');

//csrf protection
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

router.use('/upload', upload);

router.get('/add', csrfProtection, function (req, res) {
    res.render('gallery/add.html',{
        csrfToken:req.csrfToken()
    });
});

router.post('/add', parseForm, csrfProtection, function (req, res) {
    var title = req.body.title;
    var story = req.body.story;
    var user = req.session.user;

    req.checkBody(title,'相册必须有名称。').notEmpty();
    req.checkBody(title, '相册名称不能多于18个字，也不能少于6个字。').isLength(6, 18);
});

module.exports = router;