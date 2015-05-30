var express = require('express');
var router = express.Router();
var upload = require('./upload');

router.use('/upload', upload);

module.exports = router;