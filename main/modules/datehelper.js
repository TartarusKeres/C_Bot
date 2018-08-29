exports.toHours = function(d) {
	var cd = new Date();
	cd.setSeconds(0);
	var diff = d - cd;
	var rawHours = diff / (1000*60*60);
	var hours = Math.trunc(rawHours);
	var min = Math.trunc((rawHours-hours)*60)+1;
	return hours + "h" + min + "m";
}

exports.toHoursFull = function(d) {
	var cd = new Date();
	cd.setSeconds(0);
	var diff = d - cd;
	var rawHours = diff / (1000*60*60);
	var hours = Math.trunc(rawHours);
	var min = Math.trunc((rawHours-hours)*60)+1;
	return hours + " hour(s) and " + min + " minute(s)";
}

exports.toDate = function(cd) {
	var d = cd.getDate();
	var m = cd.getMonth(); 
	var y = cd.getFullYear();
	return y+"-"+m.pad(2)+"-"+d.pad(2);
}

exports.getDateTime = function() {
	var currentDate = new Date();
	var d = currentDate.getDate();
	var m = currentDate.getMonth(); 
	var y = currentDate.getFullYear();
	var h = currentDate.getHours();
	var mm = currentDate.getMinutes();
	return y+"-"+m.pad(2)+"-"+d.pad(2)+" "+h.pad(2)+":"+mm.pad(2);
}

exports.getCron = function(cd) {
	var d = cd.getDate();
	var m = cd.getMonth(); 
	var h = cd.getHours();
	var mm = cd.getMinutes();
	return "1 "+mm+" "+h+" "+d+" "+(m+1)+" *";
}

Number.prototype.pad = function(size) {
  var sign = Math.sign(this) === -1 ? '-' : '';
  return sign + new Array(size).concat([Math.abs(this)]).join('0').slice(-size);
}