var dh = require(__dirname+"/datehelper.js");
var j;
var nextTrickster;
var client;

exports.initialize = function(c) {
	client = c;
	updateTricksterField();
}

exports.getNextTrickster = function() {
	var tricksterSeed = new Date("2018-08-19 14:30");
	while(tricksterSeed<=new Date()) {
		tricksterSeed.setHours(tricksterSeed.getHours()+10);
	}
	nextTrickster = tricksterSeed;
	return "Next trickster chest will spawn in " + dh.toHoursFull(nextTrickster) + "\n" + nextTrickster;
}

function updateTricksterField() {
	var tricksterSeed = new Date("2018-08-19 14:30");
	while(tricksterSeed<=new Date()) {
		tricksterSeed.setHours(tricksterSeed.getHours()+10);
	}
	nextTrickster = tricksterSeed;
	client.guilds.find(function(e){return e.name=="Carnage";}).channels.find(function(e){return e.id=="486411294476599296";}).setName("trickster in " + dh.toHours(nextTrickster));
	setTimeout(updateTricksterField, 60000);
}