var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/t/', function(req, res, next) {
  res.send('respond with a resource');
  console.log("asdasdasdasdasdasdasdasdad");
});

module.exports = router;
