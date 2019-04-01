/**
 * Tank!展示程序
 * 作者：zhouhy
 */
// 类型定义
enum Action {
	Stay = -1,
	Up, Right, Down, Left,
	UpShoot, RightShoot, DownShoot, LeftShoot
}
type PlayerAction = [Action, Action];
type FieldBinary = [number, number, number];
type FieldDisplay = {
	brick: FieldBinary;
	water: FieldBinary;
	forest: FieldBinary;
	steel: FieldBinary;
};
type NormalDisplay = {
	"0"?: { action: PlayerAction };
	"1"?: { action: PlayerAction };
	loseReason?: [string, string];
};
type DisplayLog = NormalDisplay | FieldDisplay;

// 准备库环境
if (typeof infoProvider !== 'undefined') {
	// 生产模式，需要使用 Botzone 提供的 TweenMax
	window.TweenMax = infoProvider.v2.TweenMax;
	window.TimelineMax = infoProvider.v2.TimelineMax;
    window.Ease = parent.Ease;
    window.Expo = parent.Expo;
    window.Linear = parent.Linear;
    window.Back = parent.Back;
    window.Quad = parent.Quad;
} else // 调试模式
	infoProvider = <any>{
		dbgMode: true,
		getPlayerID: () => 0,
		getPlayerNames: () => [{ name: "天天天天天天天天", imgid: "a.png" }, { name: "安安安安安安安安", imgid: "a.png" }],
		v2: {
			setRenderTickCallback: (cb: Function) => TweenMax.ticker.addEventListener('tick', cb)
		}
	};

class TickableManager {
	tickables: ITickable[] = [];

	doTick() {
		for (const tickable of this.tickables)
			tickable.onTick();
	}
}

const tickableManager = new TickableManager();

// 定义一个格子长宽为1
class TankGame {
	static readonly PLAYER_COUNT = 2;

	renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
	field: GameField;
	scale: number;
	playerSide = infoProvider.getPlayerID();
	playerNames = infoProvider.getPlayerNames();
	actionsToSubmit: PlayerAction = [Action.Stay, Action.Stay];
	waitingForAction: [boolean, boolean] = [false, false];
	
	/**
	 * 创建新的 Tank 游戏实例
	 */
	constructor() {

		// 像素画风
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

		DOM.prepare();

		DOM.elements.avatar0.src = this.playerNames[0].imgid;
		DOM.elements.avatar1.src = this.playerNames[1].imgid;
		DOM.elements.playerName0.textContent = this.playerNames[0].name;
		DOM.elements.playerName1.textContent = this.playerNames[1].name;

		const gradientDef: [number, HTMLElement][] = [
			[Colors.BLUE, DOM.elements.playerData0], [Colors.RED, DOM.elements.playerData1]
		];
		for (const [color, playerData] of gradientDef) {
			(<any>playerData).append(DOM.generatePixelatedGradient(
				color,
				playerData.clientWidth,
				Math.floor(window.innerHeight / playerData.clientWidth)
			));
		}

		let options: PIXI.RendererOptions = {
			antialias: false,
			transparent: false,
			backgroundColor: Util.colors.scale(Colors.FIELD_BKG, 0.8),
			roundPixels: true,
			view: DOM.elements.field
		};
		try {
			this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, options);
		} catch (ex) {
			console.log("自动检测渲染器失败：", ex);
			this.renderer = new PIXI.CanvasRenderer(window.innerWidth, window.innerHeight, options);
		}
		Assets.generateTextures();
		this.field = new GameField();
		this.resize();
		window.addEventListener('resize', () => this.resize());

		// 开始渲染
		infoProvider.v2.setRenderTickCallback(() => {
			this.renderer.render(this.field);
			tickableManager.doTick();
		});
		infoProvider.v2.setRequestCallback(req => {
			for (const tank of this.field.tanks[this.playerSide]) {
				if (tank.alive) {
					const panel: HTMLElement = DOM.elements[`tank${tank.tank}panel`];
					let c = tank.c;
					let r = tank.r;
					if (c < GameField.FIELD_WIDTH / 2) {
						c++;
					}
					if (r < GameField.FIELD_HEIGHT / 2) {
						r++;
					}
					panel.style.display = "inherit";
					panel.style.left = c * this.scale + "px";
					panel.style.top = r * this.scale + "px";
					this.waitingForAction[tank.tank] = true;
				}
			}
			return null;
		});
		infoProvider.v2.setDisplayCallback((d: DisplayLog) => {
			DOM.elements.tank0panel.style.display = "none";
			DOM.elements.tank1panel.style.display = "none";
			if ('brick' in d) {
				this.field.constructField(d);
				return null;
			}
			const tl = new TimelineMax();
			let reasons: string[];
			if (d.loseReason) {
				reasons = d.loseReason.map((reason, i) => {
					if (!reason || !(i in d))
						return Assets.err2chn[reason];
					if (reason == "INVALID_INPUT_VERDICT_OK") {
						const validateResult =
							this.field.validateAction(i, 0, d[i].action[0]) ||
							this.field.validateAction(i, 1, d[i].action[1]);
						return validateResult || Assets.err2chn[reason];
					}
					return Assets.err2chn[reason];
				});
			}

			this.field.eachAliveTank(tank => {
				const action = d[tank.side] && d[tank.side].action[tank.tank];
				if (typeof action === "number" && action >= Action.Up && action < Action.UpShoot) {
					tl.add(this.field.doMove(tank.side, tank.tank, action), 0);
				}
			});

			this.field.eachAliveTank(tank => {
				const action = d[tank.side] && d[tank.side].action[tank.tank];
				if (typeof action === "number" && action >= Action.UpShoot) {
					tl.add(this.field.doShoot(tank.side, tank.tank, action, [d[0].action, d[1].action]), 0);
					DOM.playSound(DOM.elements.shootSound, tl, 0);
				}
			});

			tl.add(this.field.finalize());

			this.field.lastActions = [d[0].action, d[1].action];

			if (reasons) {
				if (reasons[0] && reasons[1]) {
					DOM.elements.resultTitle.textContent = "平局";
					DOM.elements.resultMessage.innerHTML =
						`<span class="side-0">蓝方</span>${
							reasons[0]
						}<br /><span class="side-1">红方</span>${
							reasons[1]
						}`;
				} else if (reasons[0]) {
					DOM.elements.resultTitle.innerHTML = '<span class="side-1">红方</span>胜利';
					DOM.elements.resultMessage.innerHTML =
						`<span class="side-0">蓝方</span>${reasons[0]}`;
				} else {
					DOM.elements.resultTitle.innerHTML = '<span class="side-0">蓝方</span>胜利';
					DOM.elements.resultMessage.innerHTML =
						`<span class="side-1">红方</span>${reasons[1]}`;
				}
				DOM.playSound(DOM.elements.victorySound, tl);
				tl.fromTo(DOM.elements.result, 0.5, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, ease: Back.easeOut });
			}
			tl.call(() => undefined, null, null, 1);
			return tl;
		});
		infoProvider.v2.setGameOverCallback(() => (this.field.updateViewpoint(-1), null));
		infoProvider.v2.notifyInitComplete();
	}

	resize() {
		this.scale = this.field.scale.x = this.field.scale.y = Math.min(
			window.innerWidth / GameField.FIELD_WIDTH,
			window.innerHeight / GameField.FIELD_HEIGHT
		);
		const w = this.scale * GameField.FIELD_WIDTH;
		const h = this.scale * GameField.FIELD_HEIGHT;
		this.renderer.resize(w, h);
		DOM.elements.main.style.height = h + "px";
		DOM.elements.main.style.width = w + "px";
	}

	submitAction(tank: number, action: Action) {
		const validateResult = this.field.validateAction(this.playerSide, tank, action);
		if (validateResult) {
			parent["Botzone"].alert(validateResult);
			return;
		}
		const panel: HTMLElement = DOM.elements[`tank${tank}panel`];
		panel.style.display = "none";
		this.actionsToSubmit[tank] = action;
		this.waitingForAction[tank] = false;
		if (!this.waitingForAction[0] && !this.waitingForAction[1]) {
			infoProvider.notifyPlayerMove(this.actionsToSubmit);
			DOM.playSound(DOM.elements.selectSound);
		}
	}
}

let game: TankGame;
let windowLoaded = false;

function init() {
	if (!windowLoaded || !DOM.textureLoaded) {
		return;
	}
	try {
		game = new TankGame();
	} catch (ex) {
		parent["Botzone"].alert(
			"播放器载入失败……"
		);
		console.log("播放器初始化失败：", ex);
		infoProvider.v2.setRequestCallback(() => undefined);
		infoProvider.v2.setDisplayCallback(() => undefined);
		infoProvider.v2.notifyInitComplete();
	}
}

window.addEventListener("load", () => {
	if (!infoProvider["dbgMode"])
		infoProvider.v2.setMinSize(0, 475);
	TweenMax.ticker.fps(25);
	windowLoaded = true;
	init();
});
