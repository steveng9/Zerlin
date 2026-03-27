const spk = Constants.SparkConstants;

class Spark extends Entity {

	constructor(game, sceneManager, xy) {
		super(game, xy.x, xy.y);
		this.ctx = this.game.ctx;
		this.camera = sceneManager.camera;
		this.deltaX = (Math.random() - .5) * spk.MAX_VELOCITY;
		this.deltaY = (Math.random() - .5) * spk.MAX_VELOCITY;
		this.timeToLive = Math.random() * spk.MAX_TIME_ALIVE;
	}

	update() {
		this.timeToLive -= this.game.clockTick;
		if (this.timeToLive <= 0) {
			this.removeFromWorld = true;
		}

		// this.deltaY += zc.GRAVITATIONAL_ACCELERATION / 3 * this.game.clockTick;

		this.x += this.deltaX * this.game.clockTick;
		this.y += this.deltaY * this.game.clockTick;
	}

	draw() {
		this.ctx.fillStyle = "yellow";
		this.ctx.fillRect(this.x - this.camera.x, this.y, spk.WIDTH, spk.WIDTH);
		this.ctx.fillStyle = "white";
		this.ctx.fillRect(this.x - this.camera.x + spk.WIDTH / 4, this.y + spk.WIDTH / 4, spk.WIDTH / 2, spk.WIDTH / 2);
	}

}