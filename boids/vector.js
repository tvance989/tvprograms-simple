function Vector(x, y) {
	this.x = x || 0;
	this.y = y || 0;
}

/** Simple arithmetic */
Vector.prototype.add = function(v) {
	return new Vector(this.x + v.x, this.y + v.y);
}
Vector.prototype.sub = function(v) {
	return new Vector(this.x - v.x, this.y - v.y);
}
Vector.prototype.scale = function(n) {
	return new Vector(this.x * n, this.y * n);
}

Vector.prototype.magnitude = function() {
	return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2));
}
Vector.prototype.normalize = function() {
	return this.scale(1 / this.magnitude());
}
Vector.prototype.setMagnitude = function(n) {
	return this.normalize().scale(n);
}

/** Don't let the vector be longer than n. */
Vector.prototype.limit = function(n) {
	// If the vector's longer, limit it.
	if(this.magnitude() > n) return this.setMagnitude(n);
	// Else, do nothing.
	return this;
}

/** Distance between two vectors. */
Vector.prototype.distance = function(v) {
	return v.sub(this).magnitude();
}

/** Dot product */
Vector.prototype.dot = function(v) {
	return this.x * v.x + this.y * v.y;
}
/** Determinant */
Vector.prototype.det = function(v) {
	return this.x * v.y - this.y * v.x;
}
/** Scalar projection */
Vector.prototype.scalarProjection = function(v) {
	return v.setMagnitude(this.dot(v));
}

/** Angle between two vectors (between 0 and 1 radian). */
Vector.prototype.angle = function(v) {
	return Math.acos(this.dot(v) / (this.magnitude() * v.magnitude()));
}
/** Angle between two vectors (between 0 and 2 radians). */
Vector.prototype.angle2 = function(v) {
	return Math.atan2(this.dot(v), this.det(v));
}
