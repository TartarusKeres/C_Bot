var o = require("./orbus.js");
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
			var currentDate = new Date();
			var d = currentDate.getDate();
			var m = currentDate.getMonth(); 
			var y = currentDate.getFullYear();
			var h = currentDate.getHours();
			var mm = currentDate.getMinutes();
			/*c.guilds.find(function(e){return e.name=="Carnage";}).channels.find(function(e){return e.name=="bot-test-channel";}).send(
				"```" +
				"Population is '" + currPop + "'" +
				"\nPlayers Online: " + jRes["playersOnline"] +
				"\n"+y+"-"+m.pad(2)+"-"+d.pad(2)+" "+h.pad(2)+":"+mm.pad(2)+
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
				var currentDate = new Date();
				var d = currentDate.getDate();
				var m = currentDate.getMonth(); 
				var y = currentDate.getFullYear();
				var h = currentDate.getHours();
				var mm = currentDate.getMinutes();
				c.guilds.find(function(e){return e.name=="Carnage";}).channels.find(function(e){return e.name=="population";}).send(
					"```" +
					msg +
					"\n\nPopulation is '" + currPop + "'" +
					"\nPlayers Online: " + jRes["playersOnline"] +
					"\n"+y+"-"+m.pad(2)+"-"+d.pad(2)+" "+h.pad(2)+":"+mm.pad(2)+
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

Number.prototype.pad = function(size) {
  var sign = Math.sign(this) === -1 ? '-' : '';
  return sign + new Array(size).concat([Math.abs(this)]).join('0').slice(-size);
}