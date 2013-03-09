module.exports = paper = {
Point: function(x, y) {
	this.x = x;
	this.y = y;

	this.add = function(point) {
		return new paper.Point(this.x + point.x, this.y + point.y);
	};

	this.subtract = function(point) {
		return new paper.Point(this.x - point.x, this.y - point.y);
	};

	this.multiply = function(value) {
		return new paper.Point(this.x * value, this.y * value);
	};

	this.divide = function(value) {
		return new paper.Point(this.x / point.x, this.y / point.y);
	}

	function getLength() {
		var l = this.x * this.x + this.y * this.y;
		return Math.sqrt(l);
	}

	this.normalize = function() {
		var l = getLength();
		return (new paper.Point(this.x, this.y)).divide(l);
	};

	this.dot = function(point) {
		return this.x * point.x + this.y * point.y;
	};
}
};