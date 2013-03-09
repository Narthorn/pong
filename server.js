var http = require('http'),
fs = require('fs'),
jade = require('jade'),
io = require('socket.io')
paper = require('./point');

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
positions = {};
setInterval(function() {
	if(typeof puck != 'undefined') {
		puck = puck.add(dir);
		io.sockets.emit('puck', JSON.stringify(puck));
	}

	io.sockets.emit('position', JSON.stringify(positions));
}, 16);

io.sockets.on('connection', function(socket) {
	positions = {};
	var clients = io.sockets.clients(),
	pool = {size: clients.length};
	for(var i=0; i<clients.length; i++) {
		pool.player = i;
		clients[i].send(JSON.stringify(pool));
	}
	puck = new paper.Point(150, 150);
	dir = new paper.Point(Math.cos(dir = Math.random()*2*Math.PI), Math.sin(dir));

	socket.on('disconnect', function() {
		positions = {};
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
		positions[(position = JSON.parse(position)).player] = position.point;
	});
});