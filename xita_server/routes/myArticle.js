var express = require('express');
var router = express.Router();

/* GET myArticle listing. */
router.get('/', function(req, res, next) {
	console.log(req.body.username);
	console.log(req.body.password);
  
  res.contentType('json');//
  res.send(JSON.stringify({ status:"getsuccess12","passwordre": "1234567" }));
  
});

router.post('/', function(req, res) {
	//var md5 = crypto.createHash('md5');
	console.log('login router.post begin...');
	console.log(req.body.username);
	console.log(req.body.password);
  res.contentType('json');
  res.send(JSON.stringify({ status:"postsuccess","passwordre": "1234567"}));//
  res.end();
});

module.exports = router;
