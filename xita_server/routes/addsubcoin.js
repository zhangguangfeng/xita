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
			var args = helper.getArgs(config.getarticalbyrange.args);
			logger.info( args);
			
			
			// send proposal to endorser
			var request = {
				chaincodeId: config.chaincodeID,
				fcn: config.getarticalbyrange.functionName,
				args: args,
				chainId: config.channelID,
				txId: tx_id,
				nonce: nonce
			};
			// Query chaincode
		return chain.queryByChaincode(request);
	}).then(
			function(response_payloads) {
			for (let i = 0; i < response_payloads.length; i++) {
				logger.info('############### Query results after the move on PEER%j, User "b" now has  %j', i, response_payloads[i].toString('utf8'));
				res.contentType('json');
				res.send(JSON.stringify( response_payloads[i].toString('utf8')));//
				res.end();
				break;
			}
			eventhub.disconnect();
	
	}).catch(
	function(err) {
		logger.error('Failed to end to end test with error:' + err.stack ? err.stack : err);
	});
});

router.post('/', function(req, res) {
	//var md5 = crypto.createHash('md5');
	console.log('login router.addsubcoin begin...');
	global.artno +=1;
	console.log(global.artno.toString());
	console.log(req.body);
	console.log(req.body.user_id);
	
	
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
			
			args=['addsubcoin',req.body.user_id,req.body.andorsub,req.body.num];

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
