const fs = require("fs");

exports.writeFile = function(fileName, data) {
	var data = JSON.stringify(data);  
	fs.writeFileSync(fileName, data); 
}

exports.readFile = function(fileName) {
	return JSON.parse(fs.readFileSync(fileName));
}