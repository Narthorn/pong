var http = require('http'),
fs = require('fs'),
jade = require('jade'),
io = require('socket.io');

var server = http.createServer(function(req, res) {
	switch(req.url.substring(1)) {
		case 'favicon.ico':
			return false;
			break;
		case 'paper':
			res.writeHead(200, {'Content-Type': 'text/javascript'});
			fs.readFile('./paper.js', 'utf-8', function(err, data) {
				res.end(data);
			});
			break;
		default:
			res.writeHead(200, {'Content-Type': 'text/html'});
			fs.readFile('./index.jade', 'utf-8', function(err, data) {
				res.end((jade.compile(data, {pretty: true}))({}));
			});
	}
}).listen(1337, '172.30.224.21');

io = io.listen(server);

io.sockets.on('connection', function(socket) {
	var clients = io.sockets.clients(),
	pool = {size: clients.length};
	for(var i=0; i<clients.length; i++) {
		pool.player = i;
		clients[i].send(JSON.stringify(pool));
	}

	socket.on('disconnect', function() {
		var clients = io.sockets.clients(),
		index = clients.indexOf(socket),
		pool = {size: clients.length - 1};
		for(var i=0; i<clients.length; i++) {
			if(i != index) {
				pool.player = i > index ? i-1 : i;
				clients[i].send(JSON.stringify(pool));
			}
		}
	})
	.on('position', function(position) {
		socket.broadcast.emit('position', position);
	});
});