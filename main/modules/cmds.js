var o = require(__dirname+"/orbus.js");
var io = require(__dirname+"/io.js");
var rm = require(__dirname+"/raidman.js");
var tr = require(__dirname+"/trickster.js");
var fileCmds = __dirname+"/../json/cmds.json";

exports.funcArgs = 
{
	cmds: null,
	cmd: null,
	args: null,
	message: null
};

exports.help = function() {
	var helpText = "```";
	for(var i=0; i<exports.funcArgs.cmds.length; i++) {
		helpText +=
			"\n\nName: " + exports.funcArgs.cmds[i]["name"] +
			"\nSyntax: " + exports.funcArgs.cmds[i]["syntax"] +
			"\nDescription: " + exports.funcArgs.cmds[i]["description"];
	}
	helpText += "```";
	exports.funcArgs.message.author.send(helpText);
}

exports.player = function() {
	o.getPlayerData(exports.funcArgs.args[0])
	.then(function(jRes) {
		if(jRes["status"]=="success") {
			exports.funcArgs.message.channel.send(
				"__***" + jRes["characterName"] + " Stats***__" +
				"\n```" +
				"\nTime Played (hours): " + Math.round(jRes["timePlayed"]/60/60) +
				"\nRanger: " + jRes["levels"]["archer"] +
				"\nMusketeer: " + jRes["levels"]["orbhealer"] +
				"\nWarrior: " + jRes["levels"]["swordboard"] +
				"\nRunemage: " + jRes["levels"]["runemage"] +
				"\nFisherman: " + jRes["levels"]["fisher"] +
				"```"
			);
			
			var statsStr = "__***" + jRes["characterName"] + " Records***__\n```";
			var stats = jRes["stats"]
			for (var i = 0; i<stats.length; i++) {
				var name = stats[i]["name"];
				var record = stats[i]["record"];
				var excludeStats = ["shard_dungeons_completed", "raid_bosses_completed"];
				
				if(excludeStats.indexOf(name)<0) {
					statsStr += "\n" + name + ": " + record;
				}
			}
			statsStr += "```";
			exports.funcArgs.message.channel.send(statsStr);
		} else {
			exports.funcArgs.message.channel.send("Player '" + exports.funcArgs.args[0] + "' not found!");
		}
		
	}).catch(function(err){});
}

exports.online = function() {
	o.getServerData()
	.then(function(jRes) {
		exports.funcArgs.message.channel.send(
			"```" +
			"Players Online: " + jRes["playersOnline"] +
			"```"
		);
	}).catch(function(err){console.log(err);});
}

exports.textReply = function() {
	if(exports.funcArgs.cmd.name=="hello" && exports.funcArgs.message.author.id=="208439694508163072") {
		exports.funcArgs.message.channel.send("Hello father, greatest coder that ever lived, the one and only god I worship, the alpha and the omega, the one that knit me together bit by bit inside a processor!");
	} else if(exports.funcArgs.cmd.name=="hello" && exports.funcArgs.message.author.id=="310134762893344780") {
		exports.funcArgs.message.channel.send("Hello Artigon, most esteemed one, one who I think about when I'm 'saving my data' at night, one who I will never forget ;)");
	} else if(exports.funcArgs.cmd.name=="hello" && exports.funcArgs.message.author.id=="324084097947533323") {
		exports.funcArgs.message.channel.send("Hello Lia :), my friend, the greatest tank alive. You are the nicest person I have ever met!");
	} else {
		exports.funcArgs.message.channel.send(exports.funcArgs.cmd["treply"].replace("{user}", exports.funcArgs.message.author));
	}
}

exports.rTextReply = function() {
	exports.funcArgs.message.channel.send(exports.funcArgs.cmd["rtreply"][Math.floor(Math.random()*exports.funcArgs.cmd["rtreply"].length)].replace("{user}", exports.funcArgs.message.author));
}

exports.learn = function learn() {
	if(exports.funcArgs.args.length==3) {
		exports.funcArgs.cmds.push({"name":exports.funcArgs.args[0],"syntax":"$"+exports.funcArgs.args[0],"description":exports.funcArgs.args[1],"cmd":"textReply()","treply":exports.funcArgs.args[2]});
		exports.funcArgs.message.channel.send("Learned '" + exports.funcArgs.args[0] + "'!");
	} else {
		exports.funcArgs.cmds.push({"name":exports.funcArgs.args[0],"syntax":"$"+exports.funcArgs.args[0],"description":exports.funcArgs.args[1],"cmd":"rTextReply()","rtreply":exports.funcArgs.args.splice(2)});
		exports.funcArgs.message.channel.send("Learned '" + exports.funcArgs.args[0] + "'!");
	}
	io.writeFile(fileCmds, exports.funcArgs.cmds);
}

exports.unlearn = function() {
	var found = false;
	for(var i = 7; i < exports.funcArgs.cmds.length; i++) {
		if(exports.funcArgs.cmds[i]["name"].toUpperCase() == exports.funcArgs.args[0].toUpperCase()) {
			found = true;
			exports.funcArgs.cmds.splice(i, 1);
		}
	}
	
	if(found) {
		exports.funcArgs.message.channel.send("Unlearned '" + exports.funcArgs.args[0] + "'!");
	} else {
		exports.funcArgs.message.channel.send("Couldn't find command '" + exports.funcArgs.args[0] + "'!");
	}
	
	io.writeFile(fileCmds, exports.funcArgs.cmds);
}

exports.console = function() {
	var msg = "";
	for(var i=0;i<exports.funcArgs.args.length;i++) {
		msg += exports.funcArgs.args[i];
	}
	console.log(msg);
}

exports.trickster = function() {
	exports.funcArgs.message.channel.send(tr.getNextTrickster());
}

exports.raid = function() {
	rm.parseCommand(exports.funcArgs);
}