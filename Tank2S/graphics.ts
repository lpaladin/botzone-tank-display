class GraphicStorage<T extends PIXI.Sprite> {
	public all: T[] = [];
	public pointer = 0;
	constructor(public readonly maxCount: number, public readonly ctor: { new(): T }) {
		for (let i = 0; i < maxCount; i++) {
			this.all.push(new ctor());
		}
	}

	public getElement(): T {
		return this.all[this.pointer = (this.pointer + 1) % this.all.length];
	}
}

class ExplodeEffect extends PIXI.Sprite {
	static TEXTURES: PIXI.Texture[];
	static STORAGE = new GraphicStorage(6, ExplodeEffect);
	private _progress = 0;
	constructor() {
		super();
		this.visible = false;
		this.height = this.width = 1;
	}
	public get progress(): number {
		return this._progress;
	}
	public set progress(to: number) {
		this._progress = to;
		to = to * 4.6 - 0.3;
		if (to > 4 || to < 0) {
			this.visible = false;
			this.alpha = 0;
		} else if (to > 3) {
			this.alpha = 4 - to;
		} else {
			this.visible = true;
			this.alpha = 1;
			this.texture = ExplodeEffect.TEXTURES[Math.floor(to)];
		}
	}
}

class Bullet extends PIXI.Sprite {
	static TEXTURE: PIXI.Texture;
	static STORAGE = new GraphicStorage(4, Bullet);
	constructor() {
		super();
		this.visible = false;
		this.height = 4 / 16;
		this.width = 4 / 16;
		this.pivot.y = 2;
		this.pivot.x = 2;
	}
	public set direction(to: number) {
		this.texture = Bullet.TEXTURE;
		this.rotation = Math.PI * to / 2;
	}
}

class Indicator extends PIXI.Graphics implements ITickable {
	static readonly THICKNESS = 0.1;
	static readonly CORNER_PERCENTAGE = 0.4;
	private idx = 0;

	onTick() {
		this.idx = (this.idx + 1) % 30;
		const s = 0.8 + Math.floor(Math.abs(this.idx - 15) / 3) / 25;
		this.scale.set(s, s);
	}

	constructor(color: number) {
		super();
		this.pivot.set(0.5, 0.5);
		this.scale.set(0.8, 0.8);
		const corner = Indicator.CORNER_PERCENTAGE;
		this.lineStyle(Indicator.THICKNESS, color, 1);

		this.moveTo(0, corner);
		this.lineTo(0, 0);
		this.lineTo(corner, 0);
		this.moveTo(1 - corner, 0);
		this.lineTo(1, 0);
		this.lineTo(1, corner);
		this.moveTo(1, 1 - corner);
		this.lineTo(1, 1);
		this.lineTo(1 - corner, 1);
		this.moveTo(corner, 1);
		this.lineTo(0, 1);
		this.lineTo(0, 1 - corner);

		tickableManager.tickables.push(this);
	}
}