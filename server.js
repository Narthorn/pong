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
}).listen(1337, 'localhost');

io = io.listen(server, {'log level': 2});
positions = {},
lastBounced = 3;
width = (height = 300),
radius = 100,
center = new paper.Point(height / 2, height / 2);
setInterval(function() {
	if(typeof puck != 'undefined') {
		puck = puck.add(dir);
		io.sockets.emit('puck', JSON.stringify(puck));

		if(--lastBounced <= 0) {
			var p = 2 * io.sockets.clients().length,
			index = (Math.floor(puck.getAngle(center) / a) + p)%p,
			p1 = (new paper.Point(Math.cos(a * index), Math.sin(a * index))).multiply(100).add(center),
			p2 = (new paper.Point(Math.cos(a * (index+1)), Math.sin(a * (index+1)))).multiply(100).add(center),
			d = p2.subtract(p1).normalize(),
			n = new paper.Point(-d.y, d.x),
			i = p2.subtract(puck),
			dist = Math.abs(i.dot(n));
			if(dist < 3) {
				dir = d.multiply(2 * d.dot(dir)).subtract(dir);
				lastBounced = 3;
			}
		}
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
	a = Math.PI / pool.size;
	puck = center.clone();
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
		puck = center.clone();
		dir = new paper.Point(Math.cos(dir = Math.random()*2*Math.PI), Math.sin(dir));
	})
	.on('position', function(position) {
		positions[(position = JSON.parse(position)).player] = position.point;
	});
});