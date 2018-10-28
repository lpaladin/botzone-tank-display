class GameField extends PIXI.Graphics {
	static readonly FIELD_HEIGHT = 9;
	static readonly FIELD_WIDTH = 9;

	// 左上为原点
	fieldContent: (Base | Brick | Tank[])[][] = new Array(GameField.FIELD_HEIGHT);

	tanks: Tank[][];
	lastActions: PlayerAction[] = [[Action.Stay, Action.Stay], [Action.Stay, Action.Stay]];

	constructBricks(bricks: FieldBinary) {
		for (let i = 0; i < 3; i++) {
			let mask = 1;
			for (let y = i * 3; y < (i + 1) * 3; y++) {
				for (let x = 0; x < GameField.FIELD_WIDTH; x++) {
					if (bricks[i] & mask)
						this.fieldContent[y][x] = new Brick();
					mask <<= 1;
				}
			}
		}

		// 把所有物件的坐标设置好，并加入场景
		for (let r = 0; r < GameField.FIELD_HEIGHT; r++)
			for (let c = 0; c < GameField.FIELD_WIDTH; c++) {
				const item = this.fieldContent[r][c];
				if (Array.isArray(item)) {
					for (const tank of item) {
						tank.r = tank.y = r;
						tank.c = tank.x = c;
						this.addChild(tank);
					}
				} else if (item) {
					item.r = item.y = r;
					item.c = item.x = c;
					this.addChild(item);
				}
			}
		this.addChild<PIXI.Sprite>(...Bullet.STORAGE.all, ...ExplodeEffect.STORAGE.all);
	}

	constructor() {
		super();
		
		for (let r = 0; r < GameField.FIELD_HEIGHT; r++)
			this.fieldContent[r] = new Array(GameField.FIELD_WIDTH);

		this.fieldContent[0][4] = new Base(0);
		this.fieldContent[1][4] = new Steel();

		this.fieldContent[8][4] = new Base(1);
		this.fieldContent[7][4] = new Steel();

		this.tanks = [
			[
				(this.fieldContent[0][2] = [new Tank(0, 0, 2)])[0],
				(this.fieldContent[0][6] = [new Tank(0, 1, 2)])[0]
			],
			[
				(this.fieldContent[8][6] = [new Tank(1, 0, 0)])[0],
				(this.fieldContent[8][2] = [new Tank(1, 1, 0)])[0]
			]
		];
	
		let w = this.width = GameField.FIELD_WIDTH;
		let h = this.height = GameField.FIELD_HEIGHT;
		for (let y = 0; y < h; y++)
			for (let x = 0; x < w; x++) {
				const rnd = Math.random() / 4;
				const sideColor = Util.colors.add(Colors.BLUE, y / h, Colors.RED, 1 - y / h);
				this.beginFill(Util.colors.add(sideColor, 1 - rnd, 0, rnd), 1);
				this.drawRect(x, y, 1, 1);
			}
	}

	eachAliveTank(cb: (tank: Tank) => void) {
		this.tanks.forEach(tanks => tanks.forEach(tank => {
			if (tank.alive) {
				cb(tank);
			}
		}));
	}

	validateAction(side: number, tank: number, action: Action): string | false {
		if (action >= Action.UpShoot && this.lastActions[side][tank] >= Action.UpShoot)
			return "试图连续两回合发射炮弹";
		if (action == Action.Stay || action >= Action.UpShoot)
			return false;
		const x = this.tanks[side][tank].c + Util.dx[action],
			y = this.tanks[side][tank].r + Util.dy[action];
		if (this.inRange(x, y) && !this.fieldContent[y][x])
			return false;
		return "移动目标不可达";
	}

	inRange(x: number, y: number) {
		return x >= 0 && x < GameField.FIELD_WIDTH && y >= 0 && y < GameField.FIELD_HEIGHT;
	}

	itemsToBeDestroyed: FieldItem[] = [];

	removeFieldItem(item: FieldItem) {
		const prevSlot = this.fieldContent[item.r][item.c];
		if (Array.isArray(prevSlot) && item instanceof Tank) {
			prevSlot.splice(prevSlot.indexOf(item), 1);
			if (prevSlot.length == 0) {
				this.fieldContent[item.r][item.c] = undefined;
			}
		} else {
			this.fieldContent[item.r][item.c] = undefined;
		}
	}

	insertFieldItem(item: FieldItem) {
		const nextSlot = this.fieldContent[item.r][item.c];
		if (item instanceof Tank) {
			if (nextSlot && Array.isArray(nextSlot)) {
				nextSlot.push(item);
			} else {
				this.fieldContent[item.r][item.c] = [item];
			}
		} else {
			this.fieldContent[item.r][item.c] = item;
		}
	}

	doMove(side: number, tankID: number, action: Action) {
		const tank = this.tanks[side][tankID];
		const dir = action;
		const tl = new TimelineMax();
		tl.add(Util.biDirectionConstantSet(tank, ["direction", dir]));
		tl.fromTo(tank, 0.5, { x: tank.c, y: tank.r, moveProgress: 0 },
			{ x: tank.c + Util.dx[dir], y: tank.r + Util.dy[dir], moveProgress: 1, ease: Linear.easeNone, immediateRender: false });
		this.removeFieldItem(tank);
		tank.c += Util.dx[dir];
		tank.r += Util.dy[dir];
		this.insertFieldItem(tank);
		return tl;
	}

	doShoot(side: number, tankID: number, action: Action, allAction: [PlayerAction, PlayerAction]) {
		const tank = this.tanks[side][tankID];
		const dir = action % 4;
		const tl = new TimelineMax();
		tl.add(Util.biDirectionConstantSet(tank, ["direction", dir]));
		tl.to(tank, 0.1, { alpha: 0.8, yoyo: true, repeat: 1 });
		let collides: Base | Brick | Tank[];
		let x = tank.c, y = tank.r;
		let mySlot = this.fieldContent[tank.r][tank.c];
		let multipleTankWithMe = Array.isArray(mySlot) && mySlot.length > 1;
		let oppositeShoot = false;
		while (true) {
			x += Util.dx[dir];
			y += Util.dy[dir];
			if (!this.inRange(x, y)) {
				break;
			}
			collides = this.fieldContent[y][x];
			if (collides) {
				if (Array.isArray(collides)) {
					if (!multipleTankWithMe && collides.length == 1) {
						const oppAction = (allAction[collides[0].side] || {})[collides[0].tank];
						if (oppAction >= Action.UpShoot && dir == (oppAction + 2) % 4) {
							oppositeShoot = true;
							break;
						}
					}
					for (const t of collides) {
						if (this.itemsToBeDestroyed.indexOf(t) == -1) {
							this.itemsToBeDestroyed.push(t);
						}
					}
				} else {
					if (this.itemsToBeDestroyed.indexOf(collides) == -1) {
						this.itemsToBeDestroyed.push(collides);
					}
				}
				break;
			}
		}
		const bullet = Bullet.STORAGE.getElement();
		tl.add(Util.biDirectionConstantSet(bullet, ["visible", true], ["direction", dir]));
		const fromX = tank.c + (Util.dx[dir] + 1) * 0.5;
		const fromY = tank.r + (Util.dy[dir] + 1) * 0.5;
		if (oppositeShoot) {
			tl.fromTo(bullet, 0.5, { x: fromX, y: fromY }, {
				x: (x + tank.c) / 2 + 0.5,
				y: (y + tank.r) / 2 + 0.5,
				ease: Linear.easeNone, immediateRender: false
			});
		} else {
			tl.fromTo(bullet, 0.5, { x: fromX, y: fromY }, { x: x + 0.5, y: y + 0.5, ease: Linear.easeNone, immediateRender: false });
		}
		tl.add(Util.biDirectionConstantSet(bullet, ["visible", false]));
		return tl;
	}

	finalize() {
		if (!this.itemsToBeDestroyed) {
			return null;
		}
		const tl = new TimelineMax();
		for (const item of this.itemsToBeDestroyed) {
			const explode = ExplodeEffect.STORAGE.getElement();
			tl.fromTo(explode, 0.5, { progress: 0, x: item.c, y: item.r }, { progress: 1, immediateRender: false }, 0);
			if (item instanceof Steel) {
				continue;
			}
			tl.add(Util.biDirectionConstantSet(item, ["destroyed", true]), 0.25);
			if (item instanceof Tank) {
				item.alive = false;
			}
			if (item instanceof Tank || item instanceof Base) {
				DOM.playSound(DOM.elements.destroyLargeSound, tl, 0);
			} else {
				DOM.playSound(DOM.elements.destroySound, tl, 0);
			}
			this.removeFieldItem(item);
		}
		this.itemsToBeDestroyed = [];
		return tl;
	}
}