var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.contentType('json');
  res.send(JSON.stringify({ article_id:global.artno.toString(),KnowledgeShares: "500"}));//
  res.end();
});

router.post('/', function(req, res) {
	//var md5 = crypto.createHash('md5');
	console.log('login router.post begin...');
	global.artno +=1;
	console.log(global.artno.toString());
	console.log(req.body);
	
	res.contentType('json');
	res.send(JSON.stringify({ article_id:global.artno.toString(),KnowledgeShares: "500"}));//
	res.end();
				
	
});
module.exports = router;
