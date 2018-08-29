var o = require("./orbus.js");
var dh = require(__dirname+"/datehelper.js");
var lastPop, currPop, lastSent = "";
var allowSend = false;

exports.checkPopulation = function(c) {
	o.getServerData()
	.then(function(jRes) {
		if(jRes["playersOnline"]<=20) {
			currPop = "Very Low";
		} else if(jRes["playersOnline"]<=40) {
			currPop = "Low";
		} else if(jRes["playersOnline"]<=60) {
			currPop = "High";
		} else {
			currPop = "Very High";
		}
		var timeClass = "\uD83C\uDF1E";
		if(jRes["hour"]<6 || jRes["hour"]>20) {
			timeClass = "\uD83C\uDF19";
		}
		c.user.setActivity("OrbPop: " + jRes["playersOnline"] + " Time: " + jRes["time"] + " " + timeClass, { type: "PLAYING" });
		
		if(currPop!==lastPop) {
			/*c.guilds.find(function(e){return e.name=="Carnage";}).channels.find(function(e){return e.name=="bot-test-channel";}).send(
				"```" +
				"Population is '" + currPop + "'" +
				"\nPlayers Online: " + jRes["playersOnline"] +
				"\n"+dh.getDateTime()+
				"```"
			);*/
		}
		//U+1F31E
		//U+1F319
		if((currPop=="Very Low" || currPop=="Very High") && currPop!==lastSent && allowSend) {
				var msg = "";
				if(currPop=="Very Low") {
					msg = "Time to go farm those wilds mats! Farm! Farm! Farm!";
				} else if(currPop=="Very High") {
					msg = "It's recruiting time! Make Troy proud!";
				}
				c.guilds.find(function(e){return e.name=="Carnage";}).channels.find(function(e){return e.name=="population";}).send(
					"```" +
					msg +
					"\n\nPopulation is '" + currPop + "'" +
					"\nPlayers Online: " + jRes["playersOnline"] +
					"\n"+dh.getDateTime()+
					"```"
				);
				allowSend = false;
				lastSent = currPop;
				setTimeout(exports.resetAllowSend, 1800000);
			}
		
		
		lastPop = currPop;
	}).then(function() {
		setTimeout(function(){exports.checkPopulation(c)}, 60000);
	});
}

exports.resetAllowSend = function() {
	allowSend = true;
}