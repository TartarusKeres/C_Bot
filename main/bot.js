const Discord = require("discord.js");
const client = new Discord.Client();

const auth = require(__dirname+"/json/auth.json");
var fileCmds = __dirname+"/json/cmds.json";

var c = require(__dirname+"/modules/cmds.js");
var io = require(__dirname+"/modules/io.js");
var pchk = require(__dirname+"/modules/population.js");
var rm = require(__dirname+"/modules/raidman.js");
var trck = require(__dirname+"/modules/trickster.js");

client.on("ready", () => {
	console.log("I am ready!");
	
	// Initialize command manager
	c.funcArgs.cmds = io.readFile(fileCmds);
	// Initialize raid manager
	rm.initialize(client);
	// Reset allow send on population manager to allow in 30 mintues
	setTimeout(function(){pchk.resetAllowSend()}, 1800000);
	// Start population manager
	pchk.checkPopulation(client);
	// Initialize trickster manager
	trck.initialize(client);
	
	var ch = client.guilds.find(function(e){return e.name=="Carnage";}).channels.find(function(e){return e.name=="bot-test-channel";});
	var allMsgs;
	getAllMessages(ch, (msgs, count) => {
		var cbot = 0;
		for(var i=0;i<count;i++) {
			if(msgs[i].author.username=="C Bot") {
				cbot +=1;
			}
		}
		console.log(cbot+"/"+count);
	});
	
});

function getAllMessages(pch, rMsgs) {
	pch.fetchMessages({limit: 1})
		.then(function(msgs){
			var lastId = msgs.lastKey();
			if(lastId) {
				var count = 0;
				var allMsgs = [];
				(function getAllMessagesLoop(ch, id) {
					ch.fetchMessages({limit: 100, before: id})
					.then(function(msgs){
						lastId = msgs.lastKey();
						count += msgs.size;
						allMsgs = allMsgs.concat(msgs.array());
					})
					.then(()=>{if(lastId) {getAllMessagesLoop(ch, lastId);} else {rMsgs(allMsgs, count);}})
					.catch(console.error);
				})(pch, lastId);
			}
		})
}

client.on("error", (err) => {
  console.error(err);
});

client.on("message", (message) => {
	if(message.guild === null) {
		//rm.parseResponse(message);
	} else {
		var identifier = "$";
		if (message.content.substring(0, identifier.length) == identifier) {
			c.funcArgs.args =
			message.content.substring(identifier.length).match(/\\?.|^$/g).reduce((p, q) => {
				if(q === ""){
					p.quote ^= 1;
				}else if(!p.quote && q === " "){
					p.a.push("");
				}else{
					p.a[p.a.length-1] += q.replace(/\\(.)/,"$1");
				}
				return  p;
			}, {a: [""]}).a;
			
			var tcmd = c.funcArgs.args[0];
			if(tcmd==null || tcmd=="") {
				message.channel.send("Invalid command. Please use $help to recieve a PM of commands and their descriptions.");
			} else {
				c.funcArgs.args = c.funcArgs.args.splice(1);
				c.funcArgs.cmd = c.funcArgs.cmds.find(function (cmd) { return cmd["name"].toUpperCase() === tcmd.toUpperCase(); });
				if(c.funcArgs.cmd==null) {
					message.channel.send("Invalid command. Please use $help to recieve a PM of commands and their descriptions.");
				} else {
					c.funcArgs.message = message;
					eval("c." + c.funcArgs.cmd["cmd"]);
				}
			}
		}
     }
});

client.on("messageReactionAdd", (reaction, user) => {
	console.log("React!");
	if(reaction.message.author==client.user && reaction.message.guild === null) {
		//console.log(reaction._emoji.name);
		rm.parseResponse(user, reaction._emoji.name, reaction.message);
	}
});

client.login(auth.token);