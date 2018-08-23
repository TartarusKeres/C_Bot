var s = require('node-schedule');
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
	var diff = nextTrickster - new Date();
	var rawHours = diff / (1000*60*60);
	var hours = Math.trunc(rawHours);
	var min = Math.trunc((rawHours-hours)*60);
	return "Next trickster chest will spawn in " + hours + " hour(s) and " + min + " minute(s)\n" + nextTrickster;
}

function updateTricksterField() {
	var tricksterSeed = new Date("2018-08-19 14:30");
	while(tricksterSeed<=new Date()) {
		tricksterSeed.setHours(tricksterSeed.getHours()+10);
	}
	nextTrickster = tricksterSeed;
	var diff = nextTrickster - new Date();
	var rawHours = diff / (1000*60*60);
	var hours = Math.trunc(rawHours);
	var min = Math.trunc((rawHours-hours)*60);
	client.guilds.find(function(e){return e.name=="Carnage";}).channels.find(function(e){return e.id=="481830068973338624";}).setName("trickster in " + hours + "h" + min + "m")
	setTimeout(updateTricksterField, 60000);
}

Number.prototype.pad = function(size) {
  var sign = Math.sign(this) === -1 ? '-' : '';
  return sign + new Array(size).concat([Math.abs(this)]).join('0').slice(-size);
}