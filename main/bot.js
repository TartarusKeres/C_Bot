const Discord = require("discord.js");
const client = new Discord.Client();

const auth = require("./auth.json");
var c = require("./cmds.js");
var io = require("./io.js");
var pchk = require("./population.js");
var fileCmds = "cmds.json";
var rm = require("./raidman.js");
var trck = require("./trickster.js");

//Last trickster chest 08/19/2018 2:30pm

c.funcArgs.cmds = io.readFile(fileCmds);

client.on("ready", () => {
	console.log("I am ready!");
	
	/*var users = client.users.array();
	for(var i=0;i<users.length;i++) {
		if(users[i].presence.game) {
			if(users[i].presence.game.name=="OrbusVR") {
				console.log(users[i].username);
			}
		}
	}*/
	
	rm.initialize(client);
	setTimeout(function(){pchk.resetAllowSend()}, 1800000);
	pchk.checkPopulation(client);
	trck.initialize(client);
});

client.on("error", (err) => {
  console.error(err);
});

client.on("message", (message) => {
	if(message.guild === null) {
		rm.parseResponse(message);
	} else {
		var identifier = "$";
		if (message.content.substring(0, identifier.length) == identifier) {
			c.funcArgs.args =
			message.content.substring(identifier.length).match(/\\?.|^$/g).reduce((p, q) => {
				if(q === '"'){
					p.quote ^= 1;
				}else if(!p.quote && q === ' '){
					p.a.push('');
				}else{
					p.a[p.a.length-1] += q.replace(/\\(.)/,"$1");
				}
				return  p;
			}, {a: ['']}).a;
		
			var tcmd = c.funcArgs.args[0];
			if(tcmd==null || tcmd=="") {
				c.funcArgs.cmd = c.funcArgs.cmds.find(function (cmd) { return cmd["name"] === "help"; });
			} else {
				c.funcArgs.args = c.funcArgs.args.splice(1);
				c.funcArgs.cmd = c.funcArgs.cmds.find(function (cmd) { return cmd["name"].toUpperCase() === tcmd.toUpperCase(); });
				c.funcArgs.message = message;
				eval("c." + c.funcArgs.cmd["cmd"]);
				if(c.funcArgs.cmd==null) {
					c.funcArgs.cmd = c.funcArgs.cmds.find(function (cmd) { return cmd["name"] === "help"; });
				}
			}
		}
     }
});

client.login(auth.token);