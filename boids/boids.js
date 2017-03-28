//http://natureofcode.com/book/chapter-6-autonomous-agents/
/**
 * CONFIG
 */
var SEPARATION_WEIGHT = 7;
var ALIGNMENT_WEIGHT = 4;
var COHESION_WEIGHT = 3;
var BOUND_WEIGHT = 1;
var SEEK_WEIGHT = 2;
var NEIGHBOR_RADIUS = 150;
var ELBOW_ROOM = 50;
var MAX_SPEED = 120;
var MAX_FORCE = 2;
var FPS = 30;
var NUM_BOIDS = 50;
var TIME_WARP = 1;
/** How far on each side can you see, in radians? Pi grants full 360º vision. */
var FIELD_OF_VISION = 0.9 * Math.PI;



/**
 * BOID
 */
function Boid(opts) {
	if(typeof opts === "undefined") opts = [];

	this.position = opts.position || new Vector;
	this.velocity = opts.velocity || new Vector;
	this.acceleration = opts.acceleration || new Vector;
}
//.set other prototype vars (and let demo config change them)
Boid.prototype.max_speed = MAX_SPEED;
Boid.prototype.max_force = MAX_FORCE;
Boid.prototype.calc_force = function(dt) {
	var acc = new Vector;
	acc = acc.add(this.flock());
	//acc = acc.add(this.seek(mouse).scale(SEEK_WEIGHT));
	//acc = acc.add(this.bound().scale(BOUND_WEIGHT));

	this.acceleration = acc.limit(this.max_force);
}
Boid.prototype.apply_force = function(dt) {
	dt = dt || 1;
	// Add acceleration to velocity and velocity to position.
	this.velocity = this.velocity.add(this.acceleration).limit(this.max_speed);
	this.position = this.position.add(this.velocity.scale(dt * TIME_WARP));
}
Boid.prototype.flock = function() {
	var neighbors = this.neighbors();

	var separation = this.separate(neighbors).scale(SEPARATION_WEIGHT);
	var alignment = this.align(neighbors).scale(ALIGNMENT_WEIGHT);
	var cohesion = this.cohere(neighbors).scale(COHESION_WEIGHT);

	return separation.add(alignment).add(cohesion);
}
Boid.prototype.flockmates = function() {
	//.need a better way to get boids--maybe Flock class?
	return boids;
}
Boid.prototype.neighbors = function() {
	var neighbors = [];

	this.flockmates().forEach(function(boid){
		if(boid == this) return;
		// Is it within the circle's outer square?
		if(boid.position.x > this.position.x - NEIGHBOR_RADIUS &&
			boid.position.x < this.position.x + NEIGHBOR_RADIUS &&
			boid.position.y > this.position.y - NEIGHBOR_RADIUS &&
			boid.position.y < this.position.y + NEIGHBOR_RADIUS)
		{
			// If it's close-ish, check the actual distance.
			if(boid.position.distance(this.position) < NEIGHBOR_RADIUS) {
				// Is it in its field of vision?
				if(FIELD_OF_VISION >= Math.PI || this.velocity.angle(boid.position.sub(this.position)) < FIELD_OF_VISION) {
					neighbors.push(boid);
				}
			}
		}
	}, this);

	return neighbors;
}
/**
 * RULES
 */
/** Move away from boids that are too close. */
Boid.prototype.separate = function(neighbors) {
	var v = new Vector;
	var count = 0;

	neighbors.forEach(function(boid){
		var d = this.position.distance(boid.position);
		// If it's too close for comfort...
		if(d < ELBOW_ROOM) {
			// find the vector pointing away from the boid...
			var away = this.position.sub(boid.position);
			// ...and weight that vector by distance (smaller distance => greater repulsion).
			v = v.add(away.setMagnitude(1 / d));
			count++;
		}
	}, this);

	if(count == 0) return v;

	// Steer away AFAP (as fast as possible).
	return this.steer(v.setMagnitude(this.max_speed));
}
/** Find the average direction and steer in that direction. */
Boid.prototype.align = function(neighbors) {
	var v = new Vector;
	if(neighbors.length == 0) return v;

	neighbors.forEach(function(boid){
		// Add the boid's current velocity.
		v = v.add(boid.velocity);
	}, this);

	// Steer in the average direction of neighbors AFAP.
	return this.steer(v.setMagnitude(this.max_speed));
}
/** Find the center of mass and move toward it. */
Boid.prototype.cohere = function(neighbors) {
	var v = new Vector;
	if(neighbors.length == 0) return v;

	neighbors.forEach(function(boid){
		// Add the boid's current position.
		v = v.add(boid.position);
	}, this);

	v = v.scale(1 / neighbors.length);
	return this.arrive(v);
}
Boid.prototype.steer = function(desired) {
	return desired.sub(this.velocity).limit(this.max_force);
}
Boid.prototype.seek = function(target) {
	var desired = target.sub(this.position);
	return this.steer(desired.setMagnitude(this.max_speed));
}
Boid.prototype.flee = function(target) {
	var desired = this.position.sub(target);
	return this.steer(desired);
}
Boid.prototype.arrive = function(target) {
	var desired = target.sub(this.position);
	var d = desired.magnitude();

	var arbitrary = 50;//.
	if(d < arbitrary) {
		desired = desired.setMagnitude(d * this.max_speed / arbitrary);
	} else {
		desired = desired.setMagnitude(this.max_speed);
	}

	return this.steer(desired);
}



//.might belong in demo, but how do we call it?
//.option to provide additional force functions?
Boid.prototype.bound = function() {
	var v = new Vector;

	//.change these
	var x_min = 50;
	var x_max = canvas.width - x_min;
	var y_min = 50;
	var y_max = canvas.height - y_min;

	if(this.position.x < x_min) v.x = x_min - this.position.x;
	else if(this.position.x > x_max) v.x = x_max - this.position.x;

	if(this.position.y < y_min) v.y = y_min - this.position.y;
	else if(this.position.y > y_max) v.y = y_max - this.position.y;

	return v;
}
