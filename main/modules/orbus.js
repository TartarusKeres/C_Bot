const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

exports.getPlayerData = function(playerName) {
	return new Promise(function(resolve, reject) {
		var xmlhttp = new XMLHttpRequest();
		var url = "http://api-game.orbusvr.com/public/characters/" + playerName;
		
		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var myArr = JSON.parse(this.responseText);
				//console.log(myArr);
				resolve(myArr);
			} else if (this.readyState == 4 && this.status != 200) {
				console.log(this.status);
			}
		};
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
	});
}

exports.getServerData = function() {
	return new Promise(function(resolve, reject) {
		var xmlhttp = new XMLHttpRequest();
		var url = "https://api-game.orbusvr.com/servertime";
		
		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var myArr = JSON.parse(this.responseText);
				resolve(myArr);
			} else if (this.readyState == 4 && this.status != 200) {
				console.log(this.status);
			}
		};
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
	});
}