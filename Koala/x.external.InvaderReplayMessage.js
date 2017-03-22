global.replayLink = function(roomName) {
	let tickString = Game.time.toString();
	let escapedRoomName = roomName.replace(/\d/g, (x) => '&#x' + x.charCodeAt(0).toString(16) + ';');
	return "<a href=\"https://screeps.com/a/#!/history/" + escapedRoomName +
			"?t=" + tickString + "\">" + escapedRoomName + "@" + tickString + "</a>";
}
