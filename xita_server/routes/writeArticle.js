var express = require('express');
var router = express.Router();

'use strict';

var log4js = require('log4js');
var logger = log4js.getLogger('INVOKE');

var hfc = require('fabric-client');
var utils = require('fabric-client/lib/utils.js');
var Peer = require('fabric-client/lib/Peer.js');
var Orderer = require('fabric-client/lib/Orderer.js');
var EventHub = require('fabric-client/lib/EventHub.js');

var config = require('../config.json');
var helper = require('../helper.js');


logger.setLevel('DEBUG');

var client = new hfc();
var chain;
var eventhub;
var tx_id = null;

init();

function init() {
	chain = client.newChain(config.chainName);
	chain.addOrderer(new Orderer(config.orderer.orderer_url));
	
	for (var i = 0; i < config.peers.length; i++) {
		chain.addPeer(new Peer(config.peers[i].peer_url));
	}
}

/* GET myArticle listing. */
router.get('/', function(req, res, next) {
	console.log(req.body.user_id);
	console.log(req.body.tag);
	
  
	res.contentType('json');//
	res.send(JSON.stringify({ status:"getsuccess12","passwordre": "1234567" }));
});

router.post('/', function(req, res) {
	//var md5 = crypto.createHash('md5');
	console.log('login router.post begin...');
	global.artno +=1;
	console.log(global.artno.toString());
	console.log(req.body);
	console.log(req.body.user_id);
	/*console.log(req.body.pic);
	console.log(req.body.content);
	console.log(req.body.type);
	console.log(req.body.title);*/

	
	
	eventhub = new EventHub();
	eventhub.setPeerAddr(config.events[0].event_url);
	eventhub.connect();

	hfc.newDefaultKeyValueStore({
		path: config.keyValueStore
	}).then(function(store) {
		client.setStateStore(store);
		return helper.getSubmitter(client);
	}).then(
		function(admin) {
			logger.info('Successfully obtained user to submit transaction');

			logger.info('Executing Invoke');
			tx_id = helper.getTxId();
			var nonce = utils.getNonce();
			logger.info( config.invokePublish.args);
			var args = helper.getArgs(config.invokePublish.args);
logger.info( args);
			
			//args=['publish',req.body.user_id,req.body.pic,req.body.content,req.body.type,req.body.title,global.artno.toString()];
args=[ 'publish',
  '10000006',
  '1',
  '中国证券网讯（记者 赵静）商务部部长钟山11日下午在十二届全国人大五次会议记者会上说，外贸是我国国民经济增长的重要拉动力。改革开放以来，外贸实现由小到大的发展，外贸规模从1979年的206亿美元发展到去年3.69万亿美元，我国已经成为名副其实的贸易大国。新形势下，发展对外贸易，仍然是我国一项十分重要的任务。\n　钟山说，据统计，外贸带动相关就业人数1.8亿人，外贸税收占总量18%。外贸发展事关经济社会发展全局。\n\n　　钟山说，今年1-2月，我国进出口增长了20.9%，是近几年来少有的，原因是多方面的，最根本的原因还是我国近几年来外贸转动力调结构，通过创新推动外贸发展见到成效。是否可延续这一个势头？是我们非常期待的，但是，今年外贸发展的不确定、不稳定因素仍然很多。但是，尽管整个经济的环境有很大挑战，但是有信心有决心实现今年政府工作报告提出的回稳向好目标。\n\n　　钟山说，下一步，将从供给侧发力，坚持创新驱动，始终抓住转动力调结构，加快培育外贸竞争新优势，实现外贸由量到质的提升，推动贸易强国进程。\n\n　　钟山说，我国外贸必须实现由大到强的跨越。我国外贸从小到大经历几十年时间，现在由大到强，也要经过长期的努力和奋斗，持之以恒推动，才能实现贸易强国的目标。贸易强国之梦一定能够实现。',
  '1',
  '钟山：有信心有决心实现外贸回稳向好目标',
  global.artno.toString()]
			logger.info( args);
			// send proposal to endorser
			var request = {
				chaincodeId: config.chaincodeID,
				fcn: config.invokePublish.functionName,
				args: args,
				chainId: config.channelID,
				txId: tx_id,
				nonce: nonce
			};
			return chain.sendTransactionProposal(request);
		}
	).then(
		function(results) {
			logger.info('Successfully obtained proposal responses from endorsers');

			return helper.processProposal(chain, results, 'move');
		}
	).then(
		function(response) {
			if (response.status === 'SUCCESS') {
				var handle = setTimeout(() => {
					logger.error('Failed to receive transaction notification within the timeout period');
					process.exit(1);
				}, parseInt(config.waitTime));

				eventhub.registerTxEvent(tx_id.toString(), (tx) => {
					logger.info('The chaincode transaction has been successfully committed');
					clearTimeout(handle);
					eventhub.disconnect();

					res.contentType('json');
					res.send(JSON.stringify({ article_id:global.artno.toString(),KnowledgeShares: "500"}));//
					res.end();
				});
			}
		}
	).catch(
		function(err) {
			eventhub.disconnect();
			logger.error('Failed to invoke transaction due to error: ' + err.stack ? err.stack : err);
		}
	);
	
});

module.exports = router;
