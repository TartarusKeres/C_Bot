var io = require(__dirname+"/io.js");
const admin = require(__dirname+"/../json/admin.json");
var raidFile = __dirname+"/../json/raids.json";

var client;
var raids = [];
var nextRaidId = 0;


exports.initialize = function(c) {
	client = c;
	raids = io.readFile(raidFile);
	var maxRaidId = 0;
	for(var i=0;i<raids.length;i++) {
		if(raids[i].raidId>maxRaidId) {
			maxRaidId = raids[i].raidId
		}
	}
	nextRaidId = maxRaidId + 1;
}

exports.parseCommand = function(funcArgs) {
	var args = funcArgs.args;
	var message = funcArgs.message;
	var user = message.author;
	var isAdmin = admin.includes(user.id);
	var response = "";
	switch(args[0].toUpperCase()) {
		case "CREATE":
			if(args.length==6) {
				if(!isNaN(args[2]) && !isNaN(args[3]) && !isNaN(args[4]) && !isNaN(args[5])) {
					response = createRaid(args[1], parseInt(args[2]), parseInt(args[3]), parseInt(args[4]), parseInt(args[5]));
				} else {
					response = 
						"<NumTank>, <NumHeal>, <NumDPS>, and <NumReserve> must be numbers!" +
						"\nSyntax for create is: $raid create <name> <NumTank> <NumHeal> <NumDPS> <NumReserve>";
				}
			} else {
				response = "Syntax for create is: $raid create <name> <NumTank> <NumHeal> <NumDPS> <NumReserve>";
			}
			break;
		case "DELETE":
			if(args.length==2) {
				if(!isNaN(args[1])) {
					response = deleteRaid(parseInt(args[1]));
				} else {
					response = 
						"<Raid ID> must be a number!" +
						"\nSyntax for delete is: $raid delete <Raid ID>";
				}
			} else {
				response = "Syntax for delete is: $raid delete <Raid ID>";
			}
			break;
		case "ADD":
			if(args.length==4) {
				if(!isNaN(args[1])) {
					response = addRaid(parseInt(args[1]), u(message.mentions.members.first().user.id), args[3]);
				} else {
					response = 
						"<Raid ID> must be a number!" +
						"\nSyntax for add is: $raid add <Raid ID> <@user> <Tank|Heal|DPS>";
				}
			} else {
				response = "Syntax for add is: $raid add <Raid ID> <@user> <Tank|Heal|DPS>";
			}
			break;
		case "REMOVE":
			if(args.length==3) {
				if(!isNaN(args[1])) {
					response = removeRaid(parseInt(args[1]), u(message.mentions.members.first().user.id), args[3]);
				} else {
					response = 
						"<Raid ID> must be a number!" +
						"\nSyntax for remove is: $raid remove <Raid ID> <@user>";
				}
			} else {
				response = "Syntax for remove is: $raid remove <Raid ID> <@user>";
			}
			break;
		case "JOIN":
			if(args.length==3) {
				if(!isNaN(args[1])) {
					response = joinRaid(parseInt(args[1]), u(user.id), args[2]);
				} else {
					response = 
						"<Raid ID> must be a number!" +
						"\nSyntax for join is: $raid join <Raid ID> <Tank|Heal|DPS>";
				}
			} else {
				response = "Syntax for join is: $raid join <Raid ID> <Tank|Heal|DPS>";
			}
			break;
		case "LEAVE":
			if(args.length==2) {
				if(!isNaN(args[1])) {
					response = leaveRaid(parseInt(args[1]), u(user.id));
				} else {
					response = 
						"<Raid ID> must be a number!" +
						"\nSyntax for leave is: $raid leave <Raid ID>";
				}
			} else {
				response = "Syntax for leave is: $raid leave <Raid ID>";
			}
			break;
		case "LIST":
			if(args.length==1) {
				response = listRaids();
			} else {
				response = "Syntax for list is: $raid list";
			}
			break;
		case "SHOW":
			if(args.length==2) {
				if(!isNaN(args[1])) {
					response = showRaid(parseInt(args[1]));
				} else {
					response = 
						"<Raid ID> must be a number!" +
						"\nSyntax for show is: $raid show <Raid ID>";
				}
			} else {
				response = "Syntax for show is: $raid show <Raid ID>";
			}
			break;
		case "REMINDER":
			if(isAdmin) {
				if(args.length==2) {
					if(!isNaN(args[1])) {
						response = raidReminder(parseInt(args[1]), message);
					} else {
						response = 
							"<Raid ID> must be a number!" +
							"\nSyntax for reminder is: $raid reminder <Raid ID>";
					}
				} else {
					response = "Syntax for reminder is: $raid reminder <Raid ID>";
				}
			} else {
				response = "You must be an admin to use this command!";
			}
			break;
		case "SIGNUP":
			if(isAdmin) {
				if(args.length==2) {
					if(!isNaN(args[1])) {
						response = raidSignup(parseInt(args[1]), message);
					} else {
						response = 
							"<Raid ID> must be a number!" +
							"\nSyntax for signup is: $raid signup <Raid ID>";
					}
				} else {
					response = "Syntax for signup is: $raid signup <Raid ID>";
				}
			} else {
				response = "You must be an admin to use this command!";
			}
			break;
		default:
			response = "```Please choose a raid command from the list below: " +
			"\n\n$raid create <name> <NumTank> <NumHeal> <NumDPS> <NumReserve>" +
			"\n$raid delete <Raid ID>" +
			"\n$raid add <Raid ID> <@user> <Tank|Heal|DPS>" +
			"\n$raid remove <Raid ID> <@user>" +
			"\n$raid join <Raid ID> <Tank|Heal|DPS>" +
			"\n$raid leave <Raid ID>" +
			"\n$raid list" +
			"\n$raid show <Raid ID>" +
			"\n$raid reminder <Raid ID>" +
			"\n$raid signup" +
			"```";
	}
	message.channel.send(response);
}

exports.parseResponse = function(message) {
	if(message.author!==client.user) {
		if(message.content=="tank" || message.content=="heal" || message.content=="dps") {
			message.channel.fetchMessages({ limit: 10 })
				.then(function(messages) {
					var found = false;
					for(var i=0;i<messages.array().length;i++) {
						var identifier = messages.array()[i].content.substring(0,9);
						if(identifier=="Raid ID: ") {
							var raidId = messages.array()[i].content.substring(9).substring(0,messages.array()[i].content.substring(9).indexOf(" "));
							message.channel.send(addRaid(parseInt(raidId), u(message.author.id), message.content));
							found = true;
							break;
						}
					}
					if(!found) {
						message.channel.send("Could not find a Raid ID in chat history that you were invited to!");
					}
				})
				.catch(console.error);
		} else {
			message.channel.send("Please respond with one of the following:\ntank\nheal\ndps");
		}
	}
}

function createRaid(n, t, h, d, r) {
	if(t>0 && h>0 && d>0 && t+h+d==10) {	
		raids.push(
		{
			raidId: nextRaidId,
			raidName: n,
			numTank: t,
			numHeal: h,
			numDps: d,
			numReserve: r,
			tank: [],
			heal: [],
			dps: [],
			reserve: []
		});
		nextRaidId++;
		io.writeFile(raidFile, raids);
		return "Raid ID: " + raids[raids.length-1].raidId + " Name: " + raids[raids.length-1].raidName + " created!";
	} else {
		return "Must have at least 1 tank, healer, and dps! Number of members must add up to 10!";
	}
}

function deleteRaid(id) {
	var found = false;
	var raidName = "";
	for(var i = 0; i < raids.length; i++) {
		if(raids[i].raidId==id) {
			found = true;
			raidName = raids[i].raidName;
			raids.splice(i, 1);
		}
	}
	
	if(found) {
		io.writeFile(raidFile, raids);
		return "Raid ID: " + id + " Name: " + raidName + " deleted!";
	} else {
		return "Couldn't find Raid ID: " + id + "!";
	}
}

function addRaid(id, u, c) {
	if(u) {
		return joinRaid(parseInt(id), u, c);
	} else {
		return "Invalid user mentioned!\nSyntax for add is: $raid add <Raid ID> <@user> <Tank|Heal|DPS>";
	}	
}

function removeRaid(id, u) {
	if(u) {
		return leaveRaid(parseInt(id), u);
	} else {
		return "Invalid user mentioned!\nSyntax for remove is: $raid remove <Raid ID> <@user>";
	}	
}

function joinRaid(id, u, c) {
	var cr = raids.find(function(e){return e.raidId==id});
	if(cr) {
		var tank = cr.tank.find(function(e){return e.id==u.id});
		var heal = cr.heal.find(function(e){return e.id==u.id});
		var dps = cr.dps.find(function(e){return e.id==u.id});
		if(!tank && !heal && !dps) {
			if(c.toUpperCase()=="TANK" || c.toUpperCase()=="HEAL" || c.toUpperCase()=="DPS") {
				if(c.toUpperCase()=="TANK" && cr.tank.length<cr.numTank) {
					cr.tank.push(u);
					io.writeFile(raidFile, raids);
					return "Added to Raid ID: " + cr.raidId + " Name: " + cr.raidName;
				} else if(c.toUpperCase()=="HEAL" && cr.heal.length<cr.numHeal) {
					cr.heal.push(u);
					io.writeFile(raidFile, raids);
					return "Added to Raid ID: " + cr.raidId + " Name: " + cr.raidName;
				} else if (c.toUpperCase()=="DPS" && cr.dps.length<cr.numDps) {
					cr.dps.push(u);
					io.writeFile(raidFile, raids);
					return "Added to Raid ID: " + cr.raidId + " Name: " + cr.raidName;
				} else if(cr.reserve.length<cr.numReserve) {
					cr.reserve.push(u);
					io.writeFile(raidFile, raids);
					return c.toUpperCase() + " full! You have been added to the reserve list!";
				} else {
					return c.toUpperCase() + " full! Sorry you could not be added to the raid!";
				}
			} else {
				return "You must choose tank, heal, or dps!" + "\nSyntax for join is: $raid join <Raid ID> <Tank|Heal|DPS>"
			}
		} else {
			return "You have already joined this raid!";
		}
	} else {
		return "Raid '" + id + "' does not exist!";
	}
}

function leaveRaid(id, u) {
	var cr = raids.find(function(e){return e.raidId==id});
	if(cr) {
		var tank = cr.tank.find(function(e){return e.id==u.id});
		var heal = cr.heal.find(function(e){return e.id==u.id});
		var dps = cr.dps.find(function(e){return e.id==u.id});
		if(tank) {
			cr.tank.splice(cr.tank.indexOf(tank), 1);
			io.writeFile(raidFile, raids);
			return "Removed from Raid ID: " + cr.raidId + " Name: " + cr.raidName + "!";
		} else if(heal) {
			cr.heal.splice(cr.heal.indexOf(heal), 1);
			io.writeFile(raidFile, raids);
			return "Removed from Raid ID: " + cr.raidId + " Name: " + cr.raidName + "!";
		} else if(dps) {
			cr.dps.splice(cr.dps.indexOf(dps), 1);
			io.writeFile(raidFile, raids);
			return "Removed from Raid ID: " + cr.raidId + " Name: " + cr.raidName + "!";
		} else {
			return "You are not a part of this raid!";
		}
	} else {
		return "Raid '" + id + "' does not exist!";
	}
}

function listRaids() {
	if(raids.length>0) {
		var msg = "```";
		for(var i=0;i<raids.length;i++) {
			msg += "\nID: " + raids[i].raidId + " Name: " + raids[i].raidName;
		}
		msg += "```";
	} else {
		msg = "There are no raids listed!\nUse $raid create <name> <NumTank> <NumHeal> <NumDPS> <NumReserve>"
	}
	return msg;
}

function showRaid(id) {
	var cr = raids.find(function(e){return e.raidId==id});
	if(cr) {
		var tanks = "Tanks: ";
		for(var i=0;i<cr.tank.length;i++) {
			tanks += "\n" + cr.tank[i].username;
		}
		var heals = "Healers: ";
		for(var i=0;i<cr.heal.length;i++) {
			heals += "\n" + cr.heal[i].username;
		}
		var dps = "Dps: ";
		for(var i=0;i<cr.dps.length;i++) {
			dps += "\n" + cr.dps[i].username;
		}
		var reserve = "Reserve: ";
		for(var i=0;i<cr.reserve.length;i++) {
			reserve += "\n" + cr.reserve[i].username;
		}
		return "__***ID: " + cr.raidId + " Name: " + cr.raidName + "***__" + "\n```" + tanks + "\n\n" + heals + "\n\n" + dps + "\n\n" + reserve + "```";
	} else {
		return "Raid '" + id + "' does not exist!";
	}
}

function raidReminder(id, message) {
	var client = message.client;
	var cr = raids.find(function(e){return e.raidId==id});
	if(cr) {
		for(var i=0;i<cr.tank.length;i++) {
			var user = client.users.array().find(function(e){return e.id==cr.tank[i].id;})
			user.send("Raid ID: " + cr.raidId + " Name: " + cr.raidName + " will be starting soon!");
		}
		for(var i=0;i<cr.heal.length;i++) {
			var user = client.users.array().find(function(e){return e.id==cr.heal[i].id;})
			user.send("Raid ID: " + cr.raidId + " Name: " + cr.raidName + " will be starting soon!");
		}
		for(var i=0;i<cr.dps.length;i++) {
			var user = client.users.array().find(function(e){return e.id==cr.dps[i].id;})
			user.send("Raid ID: " + cr.raidId + " Name: " + cr.raidName + " will be starting soon!");
		}
		for(var i=0;i<cr.reserve.length;i++) {
			var user = client.users.array().find(function(e){return e.id==cr.reserve[i].id;})
			user.send("Raid ID: " + cr.raidId + " Name: " + cr.raidName + " will be starting soon!");
		}
		return "Reminder sent for Raid ID " + cr.raidId + " Name: " + cr.raidName + "!";
	} else {
		return "Raid '" + id + "' does not exist!";
	}
}

function raidSignup(id, message) {
	var client = message.client;
	var cr = raids.find(function(e){return e.raidId==id});
	var raidCh = client.guilds.find(function(e){return e.name=="Carnage";}).channels.find(function(e){return e.name=="hard-raids";});
	var users = raidCh.members.array();
	/*var msgUsers = "```";
	for(var i=0;i<users.length;i++) {
		msgUsers += u(users[i].user.id).username + "\n";
	}
	msgUsers += "```";*/
	var pmMsg = 
		"Raid ID: " + cr.raidId + " Name: " + cr.raidName + " signup has been started!" +
		"\n\nPlease respond with one of the following words to signup:" +
		"\ntank" +
		"\nheal" +
		"\ndps";
		
	for(var i=0;i<users.length;i++) {
		users[i].user.send(pmMsg);
	}
	
	return "Signup sent for Raid ID " + cr.raidId + " Name: " + cr.raidName + "!";
}

function u(id) {
	var g = client.guilds.find(function(e){return e.name=="Carnage";}).members.find(function(e){return e.user.id==id;})
	if(g.nickname) {
		return {id: g.user.id, username: g.nickname};
	} else {
		return {id: g.user.id, username: g.user.username};
	}
}