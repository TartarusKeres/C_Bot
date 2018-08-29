var io = require(__dirname+"/io.js");
var dh = require(__dirname+"/datehelper.js");
var s = require('node-schedule');
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
		setRaidReminder(raids[i]);
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
			if(args.length==7) {
				if(!isNaN(args[3]) && !isNaN(args[4]) && !isNaN(args[5]) && !isNaN(args[6])) {
					response = createRaid(args[1], args[2], parseInt(args[3]), parseInt(args[4]), parseInt(args[5]), parseInt(args[6]));
				} else {
					response = 
						"<NumTank>, <NumHeal>, <NumDPS>, and <NumReserve> must be numbers!" +
						"\nSyntax for create is: $raid create <mm-dd-yyyy> <name> <NumTank> <NumHeal> <NumDPS> <NumReserve>";
				}
			} else {
				response = "Syntax for create is: $raid create <mm-dd-yyyy> <name> <NumTank> <NumHeal> <NumDPS> <NumReserve>";
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
						"\nSyntax for add is: $raid add <Raid ID> <@user> <Tank|Heal|DPS|Reserve>";
				}
			} else {
				response = "Syntax for add is: $raid add <Raid ID> <@user> <Tank|Heal|DPS|Reserve>";
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
						"\nSyntax for join is: $raid join <Raid ID> <Tank|Heal|DPS|Reserve>";
				}
			} else {
				response = "Syntax for join is: $raid join <Raid ID> <Tank|Heal|DPS|Reserve>";
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
						response = raidReminder(parseInt(args[1]));
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
				if(args.length==3) {
					if(!isNaN(args[1])) {
						response = raidSignup(parseInt(args[1]), message, args[2]);
					} else {
						response = 
							"<Raid ID> must be a number!" +
							"\nSyntax for signup is: $raid signup <Raid ID> <normal|hard>";
					}
				} else {
					response = "Syntax for signup is: $raid signup <Raid ID> <normal|hard>";
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

exports.parseResponse = function(user, emoji, message) {
	if(emoji=="🛡" || emoji=="🚑" || emoji=="⚔" || emoji=="❓") {
		var signupClass = "";
		switch(emoji) {
			case "🛡":
				signupClass = "tank";
				break;
			case "🚑":
				signupClass = "heal";
				break;
			case "⚔":
				signupClass = "dps";
				break;
			case "❓":
				signupClass = "reserve";
				break;
		}
		var identifier = message.content.substring(0,9);
		if(identifier=="Raid ID: ") {
			var raidId = message.content.substring(9).substring(0,message.content.substring(9).indexOf(" "));
			message.channel.send(addRaid(parseInt(raidId), u(user.id), signupClass));
		} else {
			message.channel.send("Could not find Raid ID! Please make sure you are reacting to the raid posting.");
		}
	} else {
		message.channel.send("Please react to the posting with one of the following:\n🛡 (shield) for Tank\n🚑 (ambulance) for Heal\n⚔ (crossed_swords) for DPS\n❓ (question) for Reserve");
	}
}

function createRaid(dt, n, t, h, d, r) {
	var rd = new Date(d);
	if(rd) {
		if(t>0 && h>0 && d>0 && t+h+d==10) {	
			var raid = {
				raidId: nextRaidId,
				raidDate: dt,
				raidName: n,
				numTank: t,
				numHeal: h,
				numDps: d,
				numReserve: r,
				tank: [],
				heal: [],
				dps: [],
				reserve: []
			};
			raids.push(raid);
			setRaidReminder(raid);
			nextRaidId++;
			io.writeFile(raidFile, raids);
			return "Raid ID: " + raids[raids.length-1].raidId + " Date: " + dh.toDate(new Date(raids[raids.length-1].raidDate)) + " Name: " + raids[raids.length-1].raidName + " created!";
		} else {
			return "Must have at least 1 tank, healer, and dps! Number of members must add up to 10!";
		}
	} else {
		return "Invalid date supplied!";
	}
}

function deleteRaid(id) {
	var found = false;
	var raidName = "";
	var raidDate = "";
	for(var i = 0; i < raids.length; i++) {
		if(raids[i].raidId==id) {
			found = true;
			raidName = raids[i].raidName;
			raidDate = raids[i].raidDate;
			raids.splice(i, 1);
		}
	}
	
	if(found) {
		io.writeFile(raidFile, raids);
		return "Raid ID: " + id + " Date: " + dh.toDate(new Date(raidDate)) + " Name: " + raidName + " deleted!";
	} else {
		return "Couldn't find Raid ID: " + id + "!";
	}
}

function addRaid(id, u, c) {
	if(u) {
		return joinRaid(parseInt(id), u, c);
	} else {
		return "Invalid user mentioned!\nSyntax for add is: $raid add <Raid ID> <@user> <Tank|Heal|DPS|Reserve>";
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
			if(c.toUpperCase()=="TANK" || c.toUpperCase()=="HEAL" || c.toUpperCase()=="DPS" || c.toUpperCase()=="RESERVE") {
				if(c.toUpperCase()=="TANK" && cr.tank.length<cr.numTank) {
					cr.tank.push(u);
					io.writeFile(raidFile, raids);
					return "Added to Raid ID: " + cr.raidId + " Date: " + dh.toDate(new Date(cr.raidDate)) + " Name: " + cr.raidName;
				} else if(c.toUpperCase()=="HEAL" && cr.heal.length<cr.numHeal) {
					cr.heal.push(u);
					io.writeFile(raidFile, raids);
					return "Added to Raid ID: " + cr.raidId + " Date: " + dh.toDate(new Date(cr.raidDate)) + " Name: " + cr.raidName;
				} else if (c.toUpperCase()=="DPS" && cr.dps.length<cr.numDps) {
					cr.dps.push(u);
					io.writeFile(raidFile, raids);
					return "Added to Raid ID: " + cr.raidId + " Date: " + dh.toDate(new Date(cr.raidDate)) + " Name: " + cr.raidName;
				} else if (c.toUpperCase()=="RESERVE" && cr.reserve.length<cr.numReserve) {
					cr.reserve.push(u);
					io.writeFile(raidFile, raids);
					return "Added to Raid ID: " + cr.raidId + " Date: " + dh.toDate(new Date(cr.raidDate)) + " Name: " + cr.raidName;
				} else if(cr.reserve.length<cr.numReserve) {
					cr.reserve.push(u);
					io.writeFile(raidFile, raids);
					return c.toUpperCase() + " full! You have been added to the reserve list!" + "\nAdded to Raid ID: " + cr.raidId + " Date: " + dh.toDate(new Date(cr.raidDate)) + " Name: " + cr.raidName;
				} else {
					return c.toUpperCase() + " full! Sorry you could not be added to the raid!";
				}
			} else {
				return "You must choose tank, heal, or dps!" + "\nSyntax for join is: $raid join <Raid ID> <Tank|Heal|DPS|Reserve>"
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
		var reserve = cr.reserve.find(function(e){return e.id==u.id});
		if(tank) {
			cr.tank.splice(cr.tank.indexOf(tank), 1);
			io.writeFile(raidFile, raids);
			return "Removed from Raid ID: " + cr.raidId + " Date: " + dh.toDate(new Date(cr.raidDate)) + " Name: " + cr.raidName + "!";
		} else if(heal) {
			cr.heal.splice(cr.heal.indexOf(heal), 1);
			io.writeFile(raidFile, raids);
			return "Removed from Raid ID: " + cr.raidId + " Date: " + dh.toDate(new Date(cr.raidDate)) + " Name: " + cr.raidName + "!";
		} else if(dps) {
			cr.dps.splice(cr.dps.indexOf(dps), 1);
			io.writeFile(raidFile, raids);
			return "Removed from Raid ID: " + cr.raidId + " Date: " + dh.toDate(new Date(cr.raidDate)) + " Name: " + cr.raidName + "!";
		} else if(reserve) {
			cr.reserve.splice(cr.reserve.indexOf(reserve), 1);
			io.writeFile(raidFile, raids);
			return "Removed from Raid ID: " + cr.raidId + " Date: " + dh.toDate(new Date(cr.raidDate)) + " Name: " + cr.raidName + "!";
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
			msg += "\nID: " + raids[i].raidId + " Date: " + dh.toDate(new Date(raids[i].raidDate)) + " Name: " + raids[i].raidName;
		}
		msg += "```";
	} else {
		msg = "There are no raids listed!\nUse $raid create <mm-dd-yyyy> <name> <NumTank> <NumHeal> <NumDPS> <NumReserve>"
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
		return "__***ID: " + cr.raidId + " Date: " + dh.toDate(new Date(cr.raidDate)) + " Name: " + cr.raidName + "***__" + "\n```" + tanks + "\n\n" + heals + "\n\n" + dps + "\n\n" + reserve + "```";
	} else {
		return "Raid '" + id + "' does not exist!";
	}
}

function raidReminder(id) {
	var cr = raids.find(function(e){return e.raidId==id});
	if(cr) {
		var rrd = new Date(cr.raidDate);
		rrd.setHours(9);
		rrd.setMinutes(30);
		for(var i=0;i<cr.tank.length;i++) {
			var user = client.users.array().find(function(e){return e.id==cr.tank[i].id;})
			user.send("Raid ID: " + cr.raidId + " Date: " + dh.toDate(new Date(cr.raidDate)) + " Name: " + cr.raidName + " will be starting in" + dh.toHoursFull(rrd) + "!");
		}
		for(var i=0;i<cr.heal.length;i++) {
			var user = client.users.array().find(function(e){return e.id==cr.heal[i].id;})
			user.send("Raid ID: " + cr.raidId + " Date: " + dh.toDate(new Date(cr.raidDate)) + " Name: " + cr.raidName + " will be starting in" + dh.toHoursFull(rrd) + "!");
		}
		for(var i=0;i<cr.dps.length;i++) {
			var user = client.users.array().find(function(e){return e.id==cr.dps[i].id;})
			user.send("Raid ID: " + cr.raidId + " Date: " + dh.toDate(new Date(cr.raidDate)) + " Name: " + cr.raidName + " will be starting in" + dh.toHoursFull(rrd) + "!");
		}
		for(var i=0;i<cr.reserve.length;i++) {
			var user = client.users.array().find(function(e){return e.id==cr.reserve[i].id;})
			user.send("Raid ID: " + cr.raidId + " Date: " + dh.toDate(new Date(cr.raidDate)) + " Name: " + cr.raidName + " will be starting in" + dh.toHoursFull(rrd) + "!");
		}
		return "Reminder sent for Raid ID " + cr.raidId + " Date: " + dh.toDate(new Date(cr.raidDate)) + " Name: " + cr.raidName + "!";
	} else {
		return "Raid '" + id + "' does not exist!";
	}
}

function setRaidReminder(cr) {
	var rrd = new Date(cr.raidDate);
	rrd.setHours(12);
	s.scheduleJob(dh.getCron(rrd), function(){
		raidReminder(cr.raidId);
	});
	rrd = new Date(cr.raidDate);
	rrd.setHours(9);
	s.scheduleJob(dh.getCron(rrd), function(){
		raidReminder(cr.raidId);
	});
	rrd = new Date(cr.raidDate);
	rrd.setHours(13);
	rrd.setMinutes(35);
	s.scheduleJob(dh.getCron(rrd), function(){
		raidReminder(cr.raidId);
	});
}

function raidSignup(id, message, raidType) {
	var client = message.client;
	var cr = raids.find(function(e){return e.raidId==id});
	var raidCh;
	if(raidType.toUpperCase()=="NORMAL") {
		raidCh = client.guilds.find(function(e){return e.name=="Carnage";}).channels.find(function(e){return e.name=="carnage";});
	} else if(raidType.toUpperCase()=="HARD") {
		raidCh = client.guilds.find(function(e){return e.name=="Carnage";}).channels.find(function(e){return e.name=="hard-raids";});
	} else {
		return "Invalid raid type supplied! Please use normal or hard!\nSyntax for signup is: $raid signup <Raid ID> <normal|hard>";
	}
	var users = raidCh.members.array();
	var pmMsg = 
		"Raid ID: " + cr.raidId + " Date: " + dh.toDate(new Date(cr.raidDate)) + " Name: " + cr.raidName + " signup has been started!" +
		"\n\nPlease react to this posting with one of the following:" +
		"\n🛡 (shield) for Tank" +
		"\n🚑 (ambulance) for Heal" +
		"\n⚔ (crossed_swords) for DPS" +
		"\n❓ (question) for Reserve" +
		"\n\n__***IF YOU ARE UNSURE ABOUT WHETHER YOU CAN MAKE IT,\nDO NOT WASTE A SLOT SOMEONE ELSE\nCAN FILL AND INSTEAD SIGNUP FOR RESERVE***__";
		
	/*for(var i=0;i<users.length;i++) {
		users[i].user.send(pmMsg);
	}*/
	client.users.get("208439694508163072").send(pmMsg);
	
	return "Signup sent for Raid ID " + cr.raidId + " Date: " + dh.toDate(new Date(cr.raidDate)) + " Name: " + cr.raidName + "!";
}

function u(id) {
	var g = client.guilds.find(function(e){return e.name=="Carnage";}).members.find(function(e){return e.user.id==id;})
	if(g.nickname) {
		return {id: g.user.id, username: g.nickname};
	} else {
		return {id: g.user.id, username: g.user.username};
	}
}