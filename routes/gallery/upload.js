var express = require('express');
var router = express.Router();
router.get('/', function (req, res) {
    res.render('gallery/upload.html');
});

module.exports = router;