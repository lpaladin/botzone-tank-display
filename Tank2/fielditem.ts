abstract class FieldItem extends PIXI.Sprite {
	public r: number; // logic variable
	public c: number; // logic variable
	protected _itemDestroyed = false;
	public get destroyed() {
		return this._itemDestroyed;
	}
	public set destroyed(to: boolean) {
		this._itemDestroyed = to;
		this.visible = !to;
	}
	constructor(texture: PIXI.Texture) {
		super(texture);
		this.height = 1;
		this.width = 1;
	}
}

class Base extends FieldItem {
	static TEXTURES: PIXI.Texture[]; // alive / destroyed
	constructor(public readonly side: number) {
		super(Base.TEXTURES[0]);
	}
	public set destroyed(to: boolean) {
		this._itemDestroyed = to;
		this.texture = Base.TEXTURES[to ? 1 : 0];
	}
}

class Brick extends FieldItem {
	static TEXTURE: PIXI.Texture;
	constructor() {
		super(Brick.TEXTURE);
	}
}

class Steel extends FieldItem {
	static TEXTURE: PIXI.Texture;
	constructor() {
		super(Steel.TEXTURE);
	}
}

class Water extends FieldItem implements ITickable {
	static TEXTURES: PIXI.Texture[];
	private idx = 0;
	
	onTick() {
		this.idx = (this.idx + 1) % 30;
		this.texture = Water.TEXTURES[Math.floor(this.idx / 10)];
	}

	constructor() {
		super(Water.TEXTURES[0]);
		tickableManager.tickables.push(this);
	}
}

class Tank extends FieldItem {
	static TEXTURES: PIXI.Texture[][][]; // side - tank - frame
	private frames: PIXI.Texture[];
	private progress = 0;
	public alive = true; // logic variable
	constructor(public readonly side: number, public readonly tank: number, public dir: number) {
		super(Tank.TEXTURES[side][tank][dir * 2]);
		this.frames = Tank.TEXTURES[side][tank];
	}
	public get direction(): number {
		return this.dir;
	}
	public set direction(to: number) {
		this.dir = to;
		this.texture = this.frames[this.dir * 2];
	}
	public get moveProgress(): number {
		return this.progress;
	}
	public set moveProgress(to: number) {
		this.progress = to;
		this.texture = this.frames[this.dir * 2 + Math.floor(to / 0.05) % 2];
	}
}
