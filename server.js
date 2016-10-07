let express = require('express');
let proxy = require('express-http-proxy');
let http = require('http');
let WebSocketServer = require('websocket').server;
const app = express();
const server = http.createServer(app);

app.use('/', proxy('localhost:4200', {
	forwardPath: function(req, res) {
		return require('url').parse(req.url).path;
	}
}));

const wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false
});

function originIsAllowed(origin) {
	// TODO
	return true;
}

wsServer.on('request', function(request) {
	if (!originIsAllowed(request.origin)) {
		request.reject();
		console.log((new Date()) + 
			' Connection fron origin ' + 
			request.origin + ' rejected.');
		return;
	}

	var connection = request.accept('player-commands', request.origin);

	connection.on('message', function(message) {
		if (message.type != 'utf8')
			return console.log('Invalid message type');
		connection.sendUTF(message.utf8Data);
	});

	connection.on('close', function(reasonCode, description) {
		console.log((new Date()) + ' Peer ' + 
			connection.remoteAddress + 
			' disconnection. Reason: ' + reasonCode);
	});
});

function observableSineWave(serverSocket, increment, period) {
	let waveVal = 0;
	setInterval(function() {
		waveVal = waveVal == period ? 0 : waveVal + increment;
		serverSocket.broadcast(
			JSON.stringify({ value: Math.sin(waveVal) }));
	}, period);
}

let port = process.env.PORT || 3000;
server.listen(port, function() {
	console.log('Example app listening on port', port);
});
