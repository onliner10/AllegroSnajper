 var soap = require('soap');
 var schedule = require('node-schedule');
 var fs = require('fs');

 var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
 var webApiUrl = 'https://webapi.allegro.pl/service.php?wsdl';
 var scheduledBid = new Date(Date.parse(config.bidOptions.placeBidAt));

 
 console.log("Will make bid \n" + JSON.stringify(config.bidOptions) + " at time \n" + scheduledBid)

 schedule.scheduleJob(scheduledBid, function() {
 	console.log("------------------------------------")
 	console.log("Making scheduled bid")
 	console.log(JSON.stringify(config.bidOptions))

 	makeBid(config.credentials, config.bidOptions);
 });

 function makeBid(credentials, bidOptions) {

 	soap.createClient(webApiUrl, function(err, client) {
 		doLogin(client, credentials, function(sessionHandle) {
 			client.doBidItem({
 				sessionHandle: sessionHandle,
 				bidItId: bidOptions.auctionId,
 				bidUserPrice: bidOptions.bidPrice,
 				bidQuantity: bidOptions.bidQuantity
 			}, function(err, result) {
 				console.log(JSON.stringify(result));
 			})
 		});
 	});
 }

 function doLogin(client, credentials, callback) {
 	client.doQuerySysStatus({
 		sysvar: 1,
 		countryId: 1,
 		webapiKey: credentials.webapiKey
 	}, function(err, result) {
 		var versionKey = result.verKey;

 		client.doLogin({
 			userLogin: credentials.userLogin,
 			userPassword: credentials.userPassword,
 			countryCode: 1,
 			webapiKey: credentials.webapiKey,
 			localVersion: versionKey
 		}, function(err, result) {
 			callback(result.sessionHandlePart);
 		});
 	});
 }