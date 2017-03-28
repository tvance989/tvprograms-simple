/**
 * RENDER
 */
var canvas = document.getElementById('canvas');
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

var ctx = canvas.getContext('2d');

function render() {
	ctx.fillStyle = '#def';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	boids.forEach(function(boid){
		boid.wrap();
		boid.draw();
	});
}
function drawTriangle(center, radius, angle, color) {
	ctx.save();
	ctx.translate(center.x, center.y);
	ctx.rotate(angle);
	ctx.beginPath();
	ctx.moveTo(0, -radius);
	ctx.lineTo(radius * 0.6, radius * 0.8);
	ctx.lineTo(-radius * 0.6, radius * 0.8);
	ctx.lineTo(0,-radius);
	ctx.stroke();
	ctx.fillStyle = color || '#000';
	ctx.fill();
	ctx.restore();
}



/**
 * More Boid prototype
 */
Boid.prototype.draw = function() {
	var doTriangle = true;
	if(doTriangle) {
		drawTriangle(this.position, 10, this.velocity.angle2(new Vector(1, 0)), '#fed');
	} else {
		//vel
		ctx.strokeStyle = '#bbb';
		ctx.beginPath();
		ctx.moveTo(this.position.x, this.position.y);
		ctx.lineTo(this.position.x + this.velocity.x/4, this.position.y + this.velocity.y/4);
		ctx.stroke();
		//pos
		ctx.fillStyle = '#fed';
		ctx.beginPath();
		ctx.arc(this.position.x,this.position.y,7,0,2*Math.PI);
		ctx.fill();
		ctx.stroke();
	}
}
Boid.prototype.wrap = function() {
	if(this.position.x < 0) this.position.x = canvas.width;
	else if(this.position.x > canvas.width) this.position.x = 0;
	if(this.position.y < 0) this.position.y = canvas.height;
	else if(this.position.y > canvas.height) this.position.y = 0;
}



/**
 * RED (special boid)
 */
function Red(opts) {
	Boid.call(this, opts);
}
Red.prototype = new Boid;
Red.prototype.draw = function() {
	var neighbors = this.neighbors(boids);
	neighbors.forEach(function(boid){
		ctx.beginPath();
		ctx.arc(boid.position.x, boid.position.y, 15, 0, 2 * Math.PI, false);
		ctx.fillStyle = 'rgba(255,0,0,0.2)';
		ctx.fill();
	});
	var sep = this.separate(neighbors).scale(5 * SEPARATION_WEIGHT);
	var ali = this.align(neighbors).scale(5 * ALIGNMENT_WEIGHT);
	var coh = this.cohere(neighbors).scale(5 * COHESION_WEIGHT);
	var acc = sep.add(ali).add(coh);
	//velocity
	ctx.strokeStyle = '#bbb';
	ctx.beginPath();
	ctx.moveTo(this.position.x, this.position.y);
	ctx.lineTo(this.position.x + this.velocity.x, this.position.y + this.velocity.y);
	ctx.stroke();
	//sep
	ctx.strokeStyle = '#f00';
	ctx.beginPath();
	ctx.moveTo(this.position.x, this.position.y);
	ctx.lineTo(this.position.x + sep.x, this.position.y + sep.y);
	ctx.stroke();
	//ali
	ctx.strokeStyle = '#0f0';
	ctx.beginPath();
	ctx.moveTo(this.position.x, this.position.y);
	ctx.lineTo(this.position.x + ali.x, this.position.y + ali.y);
	ctx.stroke();
	//coh
	ctx.strokeStyle = '#00f';
	ctx.beginPath();
	ctx.moveTo(this.position.x, this.position.y);
	ctx.lineTo(this.position.x + coh.x, this.position.y + coh.y);
	ctx.stroke();
	//acc
	ctx.strokeStyle = '#000';
	ctx.beginPath();
	ctx.moveTo(this.position.x, this.position.y);
	ctx.lineTo(this.position.x + acc.x, this.position.y + acc.y);
	ctx.stroke();
	//BOID
	var doTriangle = true;
	if(doTriangle) {
		drawTriangle(this.position, 15, this.velocity.angle2(new Vector(1, 0)), '#f00');
	} else {
		ctx.fillStyle = '#f00';
		ctx.beginPath();
		ctx.arc(this.position.x,this.position.y,10,0,2*Math.PI);
		ctx.fill();
		ctx.stroke();
	}
	//neighborhood
	ctx.save();
	ctx.strokeStyle = '#ccc';
	ctx.beginPath();
	ctx.arc(this.position.x, this.position.y, NEIGHBOR_RADIUS, 0, 2 * Math.PI, false);
	ctx.stroke();
	//elbow room
	ctx.beginPath();
	ctx.arc(this.position.x, this.position.y, ELBOW_ROOM, 0, 2 * Math.PI, false);
	ctx.stroke();
	ctx.restore();
}



var boids = [];
function init() {
	boids = [];
	var x_min = 50;
	var x_max = canvas.width - x_min;
	var y_min = 50;
	var y_max = canvas.height - y_min;
	for(var i = 0; i < NUM_BOIDS; i++) {
		boids.push(new Boid({
			position: new Vector(Math.random() * (x_max - x_min) + x_min, Math.random() * (y_max - y_min) + y_min),
			velocity: new Vector(Math.random() * (MAX_SPEED + MAX_SPEED) - MAX_SPEED, Math.random() * (MAX_SPEED + MAX_SPEED) - MAX_SPEED)
		}));
	}
	spawn_red();
	console.log(boids);
}
init();

function tick() {
	var now = Date.now();
	var dt = (now - lastUpdate) / 1000;
	lastUpdate = now;

	boids.forEach(function(boid){
		boid.calc_force(boids);
	});
	boids.forEach(function(boid){
		boid.apply_force(dt);
	});

	render();
}

function more_boids() {
	for(var i = 0; i < 50; i++) {
		boids.push(new Boid({
			position: new Vector(i*canvas.width/50, canvas.height),
			velocity: new Vector(0, -MAX_SPEED)
		}));
	}
}
function spawn_red() {
	boids.push(new Red({
		position: new Vector(Math.random() * canvas.width, Math.random() * canvas.height),
		velocity: new Vector(Math.random() * (MAX_SPEED + MAX_SPEED) - MAX_SPEED, Math.random() * (MAX_SPEED + MAX_SPEED) - MAX_SPEED),
	}));
}

var mouse = new Vector;
function mousemove(x, y) {
	mouse.x = x;
	mouse.y = y;
}

var intervalID;
var lastUpdate;
function play() {
	pause();
	lastUpdate = Date.now();
	intervalID = setInterval(tick, 1000/FPS);
}
function pause() {
	clearInterval(intervalID);
}
play();

$("#config").append('SEPARATION_WEIGHT: <input type="number" id="SEPARATION_WEIGHT" value="'+SEPARATION_WEIGHT+'" onchange="SEPARATION_WEIGHT=this.value"><br>');
$("#config").append('ALIGNMENT_WEIGHT: <input type="number" id="ALIGNMENT_WEIGHT" value="'+ALIGNMENT_WEIGHT+'" onchange="ALIGNMENT_WEIGHT=this.value"><br>');
$("#config").append('COHESION_WEIGHT: <input type="number" id="COHESION_WEIGHT" value="'+COHESION_WEIGHT+'" onchange="COHESION_WEIGHT=this.value"><br>');
$("#config").append('BOUND_WEIGHT: <input type="number" id="BOUND_WEIGHT" value="'+BOUND_WEIGHT+'" onchange="BOUND_WEIGHT=this.value"><br>');
$("#config").append('NEIGHBOR_RADIUS: <input type="number" id="NEIGHBOR_RADIUS" value="'+NEIGHBOR_RADIUS+'" onchange="NEIGHBOR_RADIUS=this.value"><br>');
$("#config").append('ELBOW_ROOM: <input type="number" id="ELBOW_ROOM" value="'+ELBOW_ROOM+'" onchange="ELBOW_ROOM=this.value"><br>');
