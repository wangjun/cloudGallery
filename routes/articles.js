'use strict';
var express = require('express');
var router = express.Router();
var Users = require('../model/articles');
var bodyParser = require('body-parser');
var csrf = require('csurf');
var forms = require('forms');

var fields = forms.fields;
var validators = forms.validators;
var widgets = forms.widgets;


//csrf protection
// setup route middlewares
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

/* add article */
router.get('/add', csrfProtection, function(req, res) {
    var csrfToken = req.csrfToken();
    var add_form = forms.create({
        title: fields.string({ required: true }),
        content: fields.password({ required: validators.required('请输入内容') }),
        csrfToken:fields.string({ required: true, widget: widgets.hidden()})
    }).bind({ fields: { csrfToken: csrfToken } }).toHTML();
    console.log(csrfToken);
    res.render('articles/add',{
        add_form:add_form
    });
});

router.post('/add', parseForm, csrfProtection, function (req, res) {

});


module.exports = router;
