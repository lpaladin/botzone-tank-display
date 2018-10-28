enum Colors {
	WHITE = 0xFFFFFF,
	RED = 0xFF0000,
	BLUE = 0x0000FF,
	LIGHTGREEN = 0xBBFFBB,
	GOLD = 0xffd800,
	LIGHTBLUE = 0xbedbff,
	FIELD_BKG = 0xAAFFFF,
	YELLOW = 0xFFFF00,
	GREEN = 0x00AA33
}

namespace Assets {
	export const err2chn = {
		"BASE_DESTROYED": "基地被夷平",
		"TANK_ALL_DESTROYED": "坦克被全歼",
		"BASE_TANK_ALL_DESTROYED": "全军覆没",
		"INVALID_INPUT_VERDICT_RE": "程序崩溃",
		"INVALID_INPUT_VERDICT_MLE": "程序内存爆炸",
		"INVALID_INPUT_VERDICT_TLE": "决策超时",
		"INVALID_INPUT_VERDICT_NJ": "程序输出不是JSON",
		"INVALID_INPUT_VERDICT_OLE": "程序输出爆炸",
		"INVALID_INPUT_VERDICT_OK": "程序输出格式错误"
	}

	const tankSpriteDef = [
		[
			{ x: 128, y: 112 },
			{ x: 0, y: 240 }
		],
		[
			{ x: 0, y: 112 },
			{ x: 128, y: 240 }
		]
	];
	const tankSpriteFrameOrder = [ 0, 1, 6, 7, 4, 5, 2, 3 ];

	export function generateTextures() {
		const baseTexture = new PIXI.BaseTexture(DOM.elements.texture);
		Base.TEXTURES = [304, 320].map(x =>
			new PIXI.Texture(baseTexture, new PIXI.Rectangle(x, 32, 16, 16))
		);
		Brick.TEXTURE = new PIXI.Texture(baseTexture, new PIXI.Rectangle(256, 0, 16, 16));
		Steel.TEXTURE = new PIXI.Texture(baseTexture, new PIXI.Rectangle(256, 16, 16, 16));
		Tank.TEXTURES = tankSpriteDef.map(side =>
			side.map(tank =>
				tankSpriteFrameOrder.map(idx =>
					new PIXI.Texture(baseTexture, new PIXI.Rectangle(tank.x + 16 * idx, tank.y, 16, 16))
				)
			)
		);
		ExplodeEffect.TEXTURES = [0, 1, 2].map(idx =>
			new PIXI.Texture(baseTexture, new PIXI.Rectangle(256 + idx * 16, 128, 16, 16))
		);
		Bullet.TEXTURE = new PIXI.Texture(baseTexture, new PIXI.Rectangle(323, 102, 4, 4));
	}
}