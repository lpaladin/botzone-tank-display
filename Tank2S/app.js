var Colors;
(function (Colors) {
    Colors[Colors["WHITE"] = 16777215] = "WHITE";
    Colors[Colors["RED"] = 16711680] = "RED";
    Colors[Colors["BLUE"] = 255] = "BLUE";
    Colors[Colors["LIGHTGREEN"] = 12320699] = "LIGHTGREEN";
    Colors[Colors["GOLD"] = 16766976] = "GOLD";
    Colors[Colors["LIGHTBLUE"] = 12508159] = "LIGHTBLUE";
    Colors[Colors["FIELD_BKG"] = 11206655] = "FIELD_BKG";
    Colors[Colors["YELLOW"] = 16776960] = "YELLOW";
    Colors[Colors["GREEN"] = 43571] = "GREEN";
})(Colors || (Colors = {}));
var Assets;
(function (Assets) {
    Assets.err2chn = {
        "BASE_DESTROYED": "基地被夷平",
        "TANK_ALL_DESTROYED": "坦克被全歼",
        "BASE_TANK_ALL_DESTROYED": "全军覆没",
        "INVALID_INPUT_VERDICT_RE": "程序崩溃",
        "INVALID_INPUT_VERDICT_MLE": "程序内存爆炸",
        "INVALID_INPUT_VERDICT_TLE": "决策超时",
        "INVALID_INPUT_VERDICT_NJ": "程序输出不是JSON",
        "INVALID_INPUT_VERDICT_OLE": "程序输出爆炸",
        "INVALID_INPUT_VERDICT_OK": "程序输出格式错误"
    };
    var tankSpriteDef = [
        [
            { x: 128, y: 112 },
            { x: 0, y: 240 }
        ],
        [
            { x: 0, y: 112 },
            { x: 128, y: 240 }
        ]
    ];
    var tankSpriteFrameOrder = [0, 1, 6, 7, 4, 5, 2, 3];
    function generateTextures() {
        var baseTexture = new PIXI.BaseTexture(DOM.elements.texture);
        Base.TEXTURES = [304, 320].map(function (x) {
            return new PIXI.Texture(baseTexture, new PIXI.Rectangle(x, 32, 16, 16));
        });
        Brick.TEXTURE = new PIXI.Texture(baseTexture, new PIXI.Rectangle(256, 0, 16, 16));
        Steel.TEXTURE = new PIXI.Texture(baseTexture, new PIXI.Rectangle(256, 16, 16, 16));
        Forest.TEXTURE = new PIXI.Texture(baseTexture, new PIXI.Rectangle(272, 32, 16, 16));
        Water.TEXTURES = [
            new PIXI.Texture(baseTexture, new PIXI.Rectangle(256, 32, 16, 16)),
            new PIXI.Texture(baseTexture, new PIXI.Rectangle(256, 48, 16, 16)),
            new PIXI.Texture(baseTexture, new PIXI.Rectangle(272, 48, 16, 16))
        ];
        Tank.TEXTURES = tankSpriteDef.map(function (side) {
            return side.map(function (tank) {
                return tankSpriteFrameOrder.map(function (idx) {
                    return new PIXI.Texture(baseTexture, new PIXI.Rectangle(tank.x + 16 * idx, tank.y, 16, 16));
                });
            });
        });
        ExplodeEffect.TEXTURES = [0, 1, 2].map(function (idx) {
            return new PIXI.Texture(baseTexture, new PIXI.Rectangle(256 + idx * 16, 128, 16, 16));
        });
        Bullet.TEXTURE = new PIXI.Texture(baseTexture, new PIXI.Rectangle(323, 102, 4, 4));
    }
    Assets.generateTextures = generateTextures;
})(Assets || (Assets = {}));
var DOM;
(function (DOM) {
    DOM.textureLoaded = false;
    var soundEnabled = localStorage.getItem("tank-sound-enabled") == "true";
    DOM.elements = {
        texture: null,
        field: null,
        tank0panel: null,
        tank1panel: null,
        main: null,
        result: null,
        resultTitle: null,
        resultMessage: null,
        avatar0: null,
        avatar1: null,
        playerName0: null,
        playerName1: null,
        playerData0: null,
        playerData1: null,
        shootSound: null,
        victorySound: null,
        destroySound: null,
        destroyLargeSound: null,
        selectSound: null,
        soundEnabled: null,
        soundEnabledCross: null
    };
    function prepare() {
        for (var id in DOM.elements) {
            DOM.elements[id] = document.getElementById(id);
        }
        if (soundEnabled) {
            DOM.elements.soundEnabledCross.style.display = "none";
        }
    }
    DOM.prepare = prepare;
    function toggleSound() {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            DOM.elements.soundEnabledCross.style.display = "none";
        }
        else {
            DOM.elements.soundEnabledCross.style.display = "block";
        }
        localStorage.setItem("tank-sound-enabled", soundEnabled ? "true" : "false");
    }
    DOM.toggleSound = toggleSound;
    function generatePixelatedGradient(fromColor, size, count) {
        var canvas = document.createElement('canvas');
        canvas.height = size * count;
        canvas.width = size;
        var ctx = canvas.getContext('2d');
        for (var i = 0; i < count; i++) {
            ctx.fillStyle = "rgba(" + Util.colors.extract(fromColor).join(',') + ", " + i / count + ")";
            ctx.fillRect(0, size * i, size, size);
        }
        return canvas;
    }
    DOM.generatePixelatedGradient = generatePixelatedGradient;
    function onTextureLoaded() {
        DOM.textureLoaded = true;
        init();
    }
    DOM.onTextureLoaded = onTextureLoaded;
    function playSound(sound, tl, at) {
        if (tl === void 0) { tl = null; }
        if (at === void 0) { at = "+=0"; }
        var fn = function () {
            if (soundEnabled) {
                sound.currentTime = 0;
                sound.play();
            }
        };
        if (!tl) {
            fn();
        }
        else {
            tl.call(fn, null, null, at);
        }
    }
    DOM.playSound = playSound;
})(DOM || (DOM = {}));
var Util;
(function (Util) {
    var colors;
    (function (colors) {
        function extract(color) {
            return [(color & 0xff0000) >> 16, (color & 0x00ff00) >> 8, color & 0x0000ff];
        }
        colors.extract = extract;
        function add(color, degree2, color2, degree1) {
            if (color2 === void 0) { color2 = Colors.WHITE; }
            if (degree1 === void 0) { degree1 = 1; }
            var c2 = extract(color2);
            return extract(color)
                .map(function (comp, i) { return Math.min(Math.round(comp * degree1 + degree2 * c2[i]), 255); })
                .reduce(function (sum, val, i) { return (sum << 8) | val; });
        }
        colors.add = add;
        function scale(color, scale) {
            return [(color & 0xff0000) >> 16, (color & 0x00ff00) >> 8, color & 0x0000ff]
                .map(function (comp) { return Math.min(Math.round(comp * scale), 255); })
                .reduce(function (sum, val, i) { return (sum << 8) | val; });
        }
        colors.scale = scale;
    })(colors = Util.colors || (Util.colors = {}));
    function sign(x) {
        return x > 0 ? 1 : x < 0 ? -1 : 0;
    }
    Util.sign = sign;
    function rand(upper) {
        return Math.floor(Math.random() * upper);
    }
    Util.rand = rand;
    Util.dx = [0, 1, 0, -1];
    Util.dy = [-1, 0, 1, 0];
    function biDirectionConstantSet(obj) {
        var props = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            props[_i - 1] = arguments[_i];
        }
        var initial = [];
        return TweenMax.to({}, 0.001, {
            immediateRender: false,
            onComplete: function () {
                return props.forEach(function (_a, i) {
                    var propName = _a[0], to = _a[1];
                    initial[i] = obj[propName];
                    if (to instanceof Function)
                        obj[propName] = to();
                    else
                        obj[propName] = to;
                });
            },
            onReverseComplete: function () {
                return props.forEach(function (_a, i) {
                    var propName = _a[0], to = _a[1];
                    obj[propName] = initial[i];
                });
            }
        });
    }
    Util.biDirectionConstantSet = biDirectionConstantSet;
})(Util || (Util = {}));
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GameField = /** @class */ (function (_super) {
    __extends(GameField, _super);
    function GameField() {
        var _this = _super.call(this) || this;
        // 左上为原点
        _this.fieldContent = new Array(GameField.FIELD_HEIGHT);
        _this.forests = new Array(GameField.FIELD_HEIGHT);
        _this.lastActions = [[Action.Stay, Action.Stay], [Action.Stay, Action.Stay]];
        _this.itemsToBeDestroyed = [];
        for (var r = 0; r < GameField.FIELD_HEIGHT; r++) {
            _this.fieldContent[r] = new Array(GameField.FIELD_WIDTH);
            _this.forests[r] = new Array(GameField.FIELD_WIDTH);
        }
        _this.fieldContent[0][4] = new Base(0);
        _this.fieldContent[8][4] = new Base(1);
        _this.tanks = [
            [
                (_this.fieldContent[0][2] = [new Tank(0, 0, 2)])[0],
                (_this.fieldContent[0][6] = [new Tank(0, 1, 2)])[0]
            ],
            [
                (_this.fieldContent[8][6] = [new Tank(1, 0, 0)])[0],
                (_this.fieldContent[8][2] = [new Tank(1, 1, 0)])[0]
            ]
        ];
        _this.indicators = [
            [new Indicator(Colors.WHITE), new Indicator(Colors.GREEN)],
            [new Indicator(Colors.YELLOW), new Indicator(Colors.RED)]
        ];
        _this.updateViewpoint(infoProvider.isLive() ? infoProvider.getPlayerID() : -1);
        var w = _this.width = GameField.FIELD_WIDTH;
        var h = _this.height = GameField.FIELD_HEIGHT;
        for (var y = 0; y < h; y++)
            for (var x = 0; x < w; x++) {
                var rnd = Math.random() / 4;
                var sideColor = Util.colors.add(Colors.BLUE, y / h, Colors.RED, 1 - y / h);
                _this.beginFill(Util.colors.add(sideColor, 1 - rnd, 0, rnd), 1);
                _this.drawRect(x, y, 1, 1);
            }
        return _this;
    }
    GameField.prototype.constructField = function (d) {
        var def = [
            { ctor: Brick, name: 'brick' },
            { ctor: Steel, name: 'steel' },
            { ctor: Forest, name: 'forest' },
            { ctor: Water, name: 'water' }
        ];
        for (var _i = 0, def_1 = def; _i < def_1.length; _i++) {
            var _a = def_1[_i], ctor = _a.ctor, name_1 = _a.name;
            for (var i = 0; i < 3; i++) {
                var mask = 1;
                for (var y = i * 3; y < (i + 1) * 3; y++) {
                    for (var x = 0; x < GameField.FIELD_WIDTH; x++) {
                        if (d[name_1][i] & mask)
                            (ctor === Forest ? this.forests : this.fieldContent)[y][x] = new ctor();
                        mask <<= 1;
                    }
                }
            }
        }
        // 把所有物件的坐标设置好，并加入场景
        // 先放坦克
        for (var r = 0; r < GameField.FIELD_HEIGHT; r++)
            for (var c = 0; c < GameField.FIELD_WIDTH; c++) {
                var item = this.fieldContent[r][c];
                if (Array.isArray(item)) {
                    for (var _b = 0, item_1 = item; _b < item_1.length; _b++) {
                        var tank = item_1[_b];
                        tank.r = tank.y = r;
                        tank.c = tank.x = c;
                        this.addChild(tank);
                    }
                }
            }
        // 再放其他
        for (var r = 0; r < GameField.FIELD_HEIGHT; r++)
            for (var c = 0; c < GameField.FIELD_WIDTH; c++) {
                var item = this.fieldContent[r][c];
                if (item && !Array.isArray(item)) {
                    item.r = item.y = r;
                    item.c = item.x = c;
                    this.addChild(item);
                }
                var forest = this.forests[r][c];
                if (forest) {
                    forest.r = forest.y = r;
                    forest.c = forest.x = c;
                    this.addChild(forest);
                }
            }
        this.addChild.apply(this, Bullet.STORAGE.all.concat(ExplodeEffect.STORAGE.all));
        for (var _c = 0, _d = this.indicators; _c < _d.length; _c++) {
            var items = _d[_c];
            for (var _e = 0, items_1 = items; _e < items_1.length; _e++) {
                var item = items_1[_e];
                item.x = -2;
                item.y = -2;
                this.addChild(item);
            }
        }
    };
    GameField.prototype.updateViewpoint = function (fromSide) {
        for (var side = 0; side < 2; side++) {
            for (var _i = 0, _a = this.indicators[side]; _i < _a.length; _i++) {
                var item = _a[_i];
                if (fromSide !== -1 && fromSide !== side)
                    item.alpha = 0;
            }
        }
    };
    GameField.prototype.eachAliveTank = function (cb) {
        this.tanks.forEach(function (tanks) { return tanks.forEach(function (tank) {
            if (tank.alive) {
                cb(tank);
            }
        }); });
    };
    GameField.prototype.validateAction = function (side, tank, action) {
        if (action >= Action.UpShoot && this.lastActions[side][tank] >= Action.UpShoot)
            return "试图连续两回合发射炮弹";
        if (action == Action.Stay || action >= Action.UpShoot)
            return false;
        var x = this.tanks[side][tank].c + Util.dx[action], y = this.tanks[side][tank].r + Util.dy[action];
        if (this.inRange(x, y) && !this.fieldContent[y][x])
            return false;
        return "移动目标不可达";
    };
    GameField.prototype.inRange = function (x, y) {
        return x >= 0 && x < GameField.FIELD_WIDTH && y >= 0 && y < GameField.FIELD_HEIGHT;
    };
    GameField.prototype.removeFieldItem = function (item) {
        var prevSlot = this.fieldContent[item.r][item.c];
        if (Array.isArray(prevSlot) && item instanceof Tank) {
            prevSlot.splice(prevSlot.indexOf(item), 1);
            if (prevSlot.length == 0) {
                this.fieldContent[item.r][item.c] = undefined;
            }
        }
        else {
            this.fieldContent[item.r][item.c] = undefined;
        }
    };
    GameField.prototype.insertFieldItem = function (item) {
        if (!this.inRange(item.c, item.r)) {
            return;
        }
        var nextSlot = this.fieldContent[item.r][item.c];
        if (item instanceof Tank) {
            if (nextSlot && Array.isArray(nextSlot)) {
                nextSlot.push(item);
            }
            else {
                this.fieldContent[item.r][item.c] = [item];
            }
        }
        else {
            this.fieldContent[item.r][item.c] = item;
        }
    };
    GameField.prototype.doMove = function (side, tankID, action) {
        var tank = this.tanks[side][tankID];
        var dir = action;
        var tl = new TimelineMax();
        var toR = tank.r + Util.dy[dir];
        var toC = tank.c + Util.dx[dir];
        tl.add(Util.biDirectionConstantSet(tank, ["direction", dir]));
        tl.fromTo(tank, 0.5, { x: tank.c, y: tank.r, moveProgress: 0 }, { x: toC, y: toR, moveProgress: 1, ease: Linear.easeNone, immediateRender: false });
        var fromHasForest = this.forests[tank.r] && this.forests[tank.r][tank.c];
        var toHasForest = this.forests[toR] && this.forests[toR][toC];
        if (fromHasForest || toHasForest) {
            tl.fromTo(this.indicators[side][tankID], 0.5, { x: tank.c + 0.5, y: tank.r + 0.5 }, { x: toC + 0.5, y: toR + 0.5, ease: Linear.easeNone, immediateRender: false }, "-=0.5");
        }
        if (fromHasForest && !toHasForest) {
            tl.fromTo(tank, 0.5, { alpha: 0 }, { alpha: 1 }, "-=0.5");
            tl.add(Util.biDirectionConstantSet(this.indicators[side][tankID], ["x", -2], ["y", -2]));
        }
        else if (!fromHasForest && toHasForest) {
            tl.fromTo(tank, 0.5, { alpha: 1 }, { alpha: 0 }, "-=0.5");
        }
        this.removeFieldItem(tank);
        tank.c += Util.dx[dir];
        tank.r += Util.dy[dir];
        this.insertFieldItem(tank);
        return tl;
    };
    GameField.prototype.doShoot = function (side, tankID, action, allAction) {
        var tank = this.tanks[side][tankID];
        var dir = action % 4;
        var tl = new TimelineMax();
        tl.add(Util.biDirectionConstantSet(tank, ["direction", dir]));
        tl.to(tank, 0.1, { alpha: 0.8, yoyo: true, repeat: 1 });
        var collides;
        var x = tank.c, y = tank.r;
        var mySlot = this.fieldContent[tank.r][tank.c];
        var multipleTankWithMe = Array.isArray(mySlot) && mySlot.length > 1;
        var oppositeShoot = false;
        while (true) {
            x += Util.dx[dir];
            y += Util.dy[dir];
            if (!this.inRange(x, y)) {
                break;
            }
            collides = this.fieldContent[y][x];
            if (collides && !(collides instanceof Water)) {
                if (Array.isArray(collides)) {
                    if (!multipleTankWithMe && collides.length == 1) {
                        var oppAction = (allAction[collides[0].side] || {})[collides[0].tank];
                        if (oppAction >= Action.UpShoot && dir == (oppAction + 2) % 4) {
                            oppositeShoot = true;
                            break;
                        }
                    }
                    for (var _i = 0, collides_1 = collides; _i < collides_1.length; _i++) {
                        var t = collides_1[_i];
                        if (this.itemsToBeDestroyed.indexOf(t) == -1) {
                            this.itemsToBeDestroyed.push(t);
                        }
                    }
                }
                else {
                    if (this.itemsToBeDestroyed.indexOf(collides) == -1) {
                        this.itemsToBeDestroyed.push(collides);
                    }
                }
                break;
            }
        }
        var bullet = Bullet.STORAGE.getElement();
        tl.add(Util.biDirectionConstantSet(bullet, ["visible", true], ["direction", dir]));
        var fromX = tank.c + (Util.dx[dir] + 1) * 0.5;
        var fromY = tank.r + (Util.dy[dir] + 1) * 0.5;
        if (oppositeShoot) {
            tl.fromTo(bullet, 0.5, { x: fromX, y: fromY }, {
                x: (x + tank.c) / 2 + 0.5,
                y: (y + tank.r) / 2 + 0.5,
                ease: Linear.easeNone, immediateRender: false
            });
        }
        else {
            tl.fromTo(bullet, 0.5, { x: fromX, y: fromY }, { x: x + 0.5, y: y + 0.5, ease: Linear.easeNone, immediateRender: false });
        }
        tl.add(Util.biDirectionConstantSet(bullet, ["visible", false]));
        return tl;
    };
    GameField.prototype.finalize = function () {
        if (!this.itemsToBeDestroyed) {
            return null;
        }
        var tl = new TimelineMax();
        for (var _i = 0, _a = this.itemsToBeDestroyed; _i < _a.length; _i++) {
            var item = _a[_i];
            var explode = ExplodeEffect.STORAGE.getElement();
            tl.fromTo(explode, 0.5, { progress: 0, x: item.c, y: item.r }, { progress: 1, immediateRender: false }, 0);
            if (item instanceof Steel) {
                continue;
            }
            tl.add(Util.biDirectionConstantSet(item, ["destroyed", true]), 0.25);
            if (item instanceof Tank) {
                item.alive = false;
                tl.add(Util.biDirectionConstantSet(this.indicators[item.side][item.tank], ["x", -2], ["y", -2]));
            }
            if (item instanceof Tank || item instanceof Base) {
                DOM.playSound(DOM.elements.destroyLargeSound, tl, 0);
            }
            else {
                DOM.playSound(DOM.elements.destroySound, tl, 0);
            }
            this.removeFieldItem(item);
        }
        this.itemsToBeDestroyed = [];
        return tl;
    };
    GameField.FIELD_HEIGHT = 9;
    GameField.FIELD_WIDTH = 9;
    return GameField;
}(PIXI.Graphics));
var FieldItem = /** @class */ (function (_super) {
    __extends(FieldItem, _super);
    function FieldItem(texture) {
        var _this = _super.call(this, texture) || this;
        _this._itemDestroyed = false;
        _this.height = 1;
        _this.width = 1;
        return _this;
    }
    Object.defineProperty(FieldItem.prototype, "destroyed", {
        get: function () {
            return this._itemDestroyed;
        },
        set: function (to) {
            this._itemDestroyed = to;
            this.visible = !to;
        },
        enumerable: true,
        configurable: true
    });
    return FieldItem;
}(PIXI.Sprite));
var Base = /** @class */ (function (_super) {
    __extends(Base, _super);
    function Base(side) {
        var _this = _super.call(this, Base.TEXTURES[0]) || this;
        _this.side = side;
        return _this;
    }
    Object.defineProperty(Base.prototype, "destroyed", {
        set: function (to) {
            this._itemDestroyed = to;
            this.texture = Base.TEXTURES[to ? 1 : 0];
        },
        enumerable: true,
        configurable: true
    });
    return Base;
}(FieldItem));
var Brick = /** @class */ (function (_super) {
    __extends(Brick, _super);
    function Brick() {
        return _super.call(this, Brick.TEXTURE) || this;
    }
    return Brick;
}(FieldItem));
var Steel = /** @class */ (function (_super) {
    __extends(Steel, _super);
    function Steel() {
        return _super.call(this, Steel.TEXTURE) || this;
    }
    return Steel;
}(FieldItem));
var Forest = /** @class */ (function (_super) {
    __extends(Forest, _super);
    function Forest() {
        return _super.call(this, Forest.TEXTURE) || this;
    }
    return Forest;
}(FieldItem));
var Water = /** @class */ (function (_super) {
    __extends(Water, _super);
    function Water() {
        var _this = _super.call(this, Water.TEXTURES[0]) || this;
        _this.idx = 0;
        tickableManager.tickables.push(_this);
        return _this;
    }
    Water.prototype.onTick = function () {
        this.idx = (this.idx + 1) % 30;
        this.texture = Water.TEXTURES[Math.floor(this.idx / 10)];
    };
    return Water;
}(FieldItem));
var Tank = /** @class */ (function (_super) {
    __extends(Tank, _super);
    function Tank(side, tank, dir) {
        var _this = _super.call(this, Tank.TEXTURES[side][tank][dir * 2]) || this;
        _this.side = side;
        _this.tank = tank;
        _this.dir = dir;
        _this.progress = 0;
        _this.alive = true; // logic variable
        _this.frames = Tank.TEXTURES[side][tank];
        return _this;
    }
    Object.defineProperty(Tank.prototype, "direction", {
        get: function () {
            return this.dir;
        },
        set: function (to) {
            this.dir = to;
            this.texture = this.frames[this.dir * 2];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tank.prototype, "moveProgress", {
        get: function () {
            return this.progress;
        },
        set: function (to) {
            this.progress = to;
            this.texture = this.frames[this.dir * 2 + Math.floor(to / 0.05) % 2];
        },
        enumerable: true,
        configurable: true
    });
    return Tank;
}(FieldItem));
var GraphicStorage = /** @class */ (function () {
    function GraphicStorage(maxCount, ctor) {
        this.maxCount = maxCount;
        this.ctor = ctor;
        this.all = [];
        this.pointer = 0;
        for (var i = 0; i < maxCount; i++) {
            this.all.push(new ctor());
        }
    }
    GraphicStorage.prototype.getElement = function () {
        return this.all[this.pointer = (this.pointer + 1) % this.all.length];
    };
    return GraphicStorage;
}());
var ExplodeEffect = /** @class */ (function (_super) {
    __extends(ExplodeEffect, _super);
    function ExplodeEffect() {
        var _this = _super.call(this) || this;
        _this._progress = 0;
        _this.visible = false;
        _this.height = _this.width = 1;
        return _this;
    }
    Object.defineProperty(ExplodeEffect.prototype, "progress", {
        get: function () {
            return this._progress;
        },
        set: function (to) {
            this._progress = to;
            to = to * 4.6 - 0.3;
            if (to > 4 || to < 0) {
                this.visible = false;
                this.alpha = 0;
            }
            else if (to > 3) {
                this.alpha = 4 - to;
            }
            else {
                this.visible = true;
                this.alpha = 1;
                this.texture = ExplodeEffect.TEXTURES[Math.floor(to)];
            }
        },
        enumerable: true,
        configurable: true
    });
    ExplodeEffect.STORAGE = new GraphicStorage(6, ExplodeEffect);
    return ExplodeEffect;
}(PIXI.Sprite));
var Bullet = /** @class */ (function (_super) {
    __extends(Bullet, _super);
    function Bullet() {
        var _this = _super.call(this) || this;
        _this.visible = false;
        _this.height = 4 / 16;
        _this.width = 4 / 16;
        _this.pivot.y = 2;
        _this.pivot.x = 2;
        return _this;
    }
    Object.defineProperty(Bullet.prototype, "direction", {
        set: function (to) {
            this.texture = Bullet.TEXTURE;
            this.rotation = Math.PI * to / 2;
        },
        enumerable: true,
        configurable: true
    });
    Bullet.STORAGE = new GraphicStorage(4, Bullet);
    return Bullet;
}(PIXI.Sprite));
var Indicator = /** @class */ (function (_super) {
    __extends(Indicator, _super);
    function Indicator(color) {
        var _this = _super.call(this) || this;
        _this.idx = 0;
        _this.pivot.set(0.5, 0.5);
        _this.scale.set(0.8, 0.8);
        var corner = Indicator.CORNER_PERCENTAGE;
        _this.lineStyle(Indicator.THICKNESS, color, 1);
        _this.moveTo(0, corner);
        _this.lineTo(0, 0);
        _this.lineTo(corner, 0);
        _this.moveTo(1 - corner, 0);
        _this.lineTo(1, 0);
        _this.lineTo(1, corner);
        _this.moveTo(1, 1 - corner);
        _this.lineTo(1, 1);
        _this.lineTo(1 - corner, 1);
        _this.moveTo(corner, 1);
        _this.lineTo(0, 1);
        _this.lineTo(0, 1 - corner);
        tickableManager.tickables.push(_this);
        return _this;
    }
    Indicator.prototype.onTick = function () {
        this.idx = (this.idx + 1) % 30;
        var s = 0.8 + Math.floor(Math.abs(this.idx - 15) / 3) / 25;
        this.scale.set(s, s);
    };
    Indicator.THICKNESS = 0.1;
    Indicator.CORNER_PERCENTAGE = 0.4;
    return Indicator;
}(PIXI.Graphics));
/**
 * Tank!展示程序
 * 作者：zhouhy
 */
// 类型定义
var Action;
(function (Action) {
    Action[Action["Stay"] = -1] = "Stay";
    Action[Action["Up"] = 0] = "Up";
    Action[Action["Right"] = 1] = "Right";
    Action[Action["Down"] = 2] = "Down";
    Action[Action["Left"] = 3] = "Left";
    Action[Action["UpShoot"] = 4] = "UpShoot";
    Action[Action["RightShoot"] = 5] = "RightShoot";
    Action[Action["DownShoot"] = 6] = "DownShoot";
    Action[Action["LeftShoot"] = 7] = "LeftShoot";
})(Action || (Action = {}));
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
}
else // 调试模式
    infoProvider = {
        dbgMode: true,
        getPlayerID: function () { return 0; },
        getPlayerNames: function () { return [{ name: "天天天天天天天天", imgid: "a.png" }, { name: "安安安安安安安安", imgid: "a.png" }]; },
        v2: {
            setRenderTickCallback: function (cb) { return TweenMax.ticker.addEventListener('tick', cb); }
        }
    };
var TickableManager = /** @class */ (function () {
    function TickableManager() {
        this.tickables = [];
    }
    TickableManager.prototype.doTick = function () {
        for (var _i = 0, _a = this.tickables; _i < _a.length; _i++) {
            var tickable = _a[_i];
            tickable.onTick();
        }
    };
    return TickableManager;
}());
var tickableManager = new TickableManager();
// 定义一个格子长宽为1
var TankGame = /** @class */ (function () {
    /**
     * 创建新的 Tank 游戏实例
     */
    function TankGame() {
        var _this = this;
        this.playerSide = infoProvider.getPlayerID();
        this.playerNames = infoProvider.getPlayerNames();
        this.actionsToSubmit = [Action.Stay, Action.Stay];
        this.waitingForAction = [false, false];
        // 像素画风
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        DOM.prepare();
        DOM.elements.avatar0.src = this.playerNames[0].imgid;
        DOM.elements.avatar1.src = this.playerNames[1].imgid;
        DOM.elements.playerName0.textContent = this.playerNames[0].name;
        DOM.elements.playerName1.textContent = this.playerNames[1].name;
        var gradientDef = [
            [Colors.BLUE, DOM.elements.playerData0], [Colors.RED, DOM.elements.playerData1]
        ];
        for (var _i = 0, gradientDef_1 = gradientDef; _i < gradientDef_1.length; _i++) {
            var _a = gradientDef_1[_i], color = _a[0], playerData = _a[1];
            playerData.append(DOM.generatePixelatedGradient(color, playerData.clientWidth, Math.floor(window.innerHeight / playerData.clientWidth)));
        }
        var options = {
            antialias: false,
            transparent: false,
            backgroundColor: Util.colors.scale(Colors.FIELD_BKG, 0.8),
            roundPixels: true,
            view: DOM.elements.field
        };
        try {
            this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, options);
        }
        catch (ex) {
            console.log("自动检测渲染器失败：", ex);
            this.renderer = new PIXI.CanvasRenderer(window.innerWidth, window.innerHeight, options);
        }
        Assets.generateTextures();
        this.field = new GameField();
        this.resize();
        window.addEventListener('resize', function () { return _this.resize(); });
        // 开始渲染
        infoProvider.v2.setRenderTickCallback(function () {
            _this.renderer.render(_this.field);
            tickableManager.doTick();
        });
        infoProvider.v2.setRequestCallback(function (req) {
            for (var _i = 0, _a = _this.field.tanks[_this.playerSide]; _i < _a.length; _i++) {
                var tank = _a[_i];
                if (tank.alive) {
                    var panel = DOM.elements["tank" + tank.tank + "panel"];
                    var c = tank.c;
                    var r = tank.r;
                    if (c < GameField.FIELD_WIDTH / 2) {
                        c++;
                    }
                    if (r < GameField.FIELD_HEIGHT / 2) {
                        r++;
                    }
                    panel.style.display = "inherit";
                    panel.style.left = c * _this.scale + "px";
                    panel.style.top = r * _this.scale + "px";
                    _this.waitingForAction[tank.tank] = true;
                }
            }
            return null;
        });
        infoProvider.v2.setDisplayCallback(function (d) {
            DOM.elements.tank0panel.style.display = "none";
            DOM.elements.tank1panel.style.display = "none";
            if ('brick' in d) {
                _this.field.constructField(d);
                return null;
            }
            var tl = new TimelineMax();
            var reasons;
            if (d.loseReason) {
                reasons = d.loseReason.map(function (reason, i) {
                    if (!reason || !(i in d))
                        return Assets.err2chn[reason];
                    if (reason == "INVALID_INPUT_VERDICT_OK") {
                        var validateResult = _this.field.validateAction(i, 0, d[i].action[0]) ||
                            _this.field.validateAction(i, 1, d[i].action[1]);
                        return validateResult || Assets.err2chn[reason];
                    }
                    return Assets.err2chn[reason];
                });
            }
            _this.field.eachAliveTank(function (tank) {
                var action = d[tank.side] && d[tank.side].action[tank.tank];
                if (typeof action === "number" && action >= Action.Up && action < Action.UpShoot) {
                    tl.add(_this.field.doMove(tank.side, tank.tank, action), 0);
                }
            });
            _this.field.eachAliveTank(function (tank) {
                var action = d[tank.side] && d[tank.side].action[tank.tank];
                if (typeof action === "number" && action >= Action.UpShoot) {
                    tl.add(_this.field.doShoot(tank.side, tank.tank, action, [d[0].action, d[1].action]), 0);
                    DOM.playSound(DOM.elements.shootSound, tl, 0);
                }
            });
            tl.add(_this.field.finalize());
            _this.field.lastActions = [d[0].action, d[1].action];
            if (reasons) {
                if (reasons[0] && reasons[1]) {
                    DOM.elements.resultTitle.textContent = "平局";
                    DOM.elements.resultMessage.innerHTML =
                        "<span class=\"side-0\">\u84DD\u65B9</span>" + reasons[0] + "<br /><span class=\"side-1\">\u7EA2\u65B9</span>" + reasons[1];
                }
                else if (reasons[0]) {
                    DOM.elements.resultTitle.innerHTML = '<span class="side-1">红方</span>胜利';
                    DOM.elements.resultMessage.innerHTML =
                        "<span class=\"side-0\">\u84DD\u65B9</span>" + reasons[0];
                }
                else {
                    DOM.elements.resultTitle.innerHTML = '<span class="side-0">蓝方</span>胜利';
                    DOM.elements.resultMessage.innerHTML =
                        "<span class=\"side-1\">\u7EA2\u65B9</span>" + reasons[1];
                }
                DOM.playSound(DOM.elements.victorySound, tl);
                tl.fromTo(DOM.elements.result, 0.5, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, ease: Back.easeOut });
            }
            tl.call(function () { return undefined; }, null, null, 1);
            return tl;
        });
        infoProvider.v2.setGameOverCallback(function () { return (_this.field.updateViewpoint(-1), null); });
        infoProvider.v2.notifyInitComplete();
    }
    TankGame.prototype.resize = function () {
        this.scale = this.field.scale.x = this.field.scale.y = Math.min(window.innerWidth / GameField.FIELD_WIDTH, window.innerHeight / GameField.FIELD_HEIGHT);
        var w = this.scale * GameField.FIELD_WIDTH;
        var h = this.scale * GameField.FIELD_HEIGHT;
        this.renderer.resize(w, h);
        DOM.elements.main.style.height = h + "px";
        DOM.elements.main.style.width = w + "px";
    };
    TankGame.prototype.submitAction = function (tank, action) {
        var validateResult = this.field.validateAction(this.playerSide, tank, action);
        if (validateResult) {
            parent["Botzone"].alert(validateResult);
            return;
        }
        var panel = DOM.elements["tank" + tank + "panel"];
        panel.style.display = "none";
        this.actionsToSubmit[tank] = action;
        this.waitingForAction[tank] = false;
        if (!this.waitingForAction[0] && !this.waitingForAction[1]) {
            infoProvider.notifyPlayerMove(this.actionsToSubmit);
            DOM.playSound(DOM.elements.selectSound);
        }
    };
    TankGame.PLAYER_COUNT = 2;
    return TankGame;
}());
var game;
var windowLoaded = false;
function init() {
    if (!windowLoaded || !DOM.textureLoaded) {
        return;
    }
    try {
        game = new TankGame();
    }
    catch (ex) {
        parent["Botzone"].alert("播放器载入失败……");
        console.log("播放器初始化失败：", ex);
        infoProvider.v2.setRequestCallback(function () { return undefined; });
        infoProvider.v2.setDisplayCallback(function () { return undefined; });
        infoProvider.v2.notifyInitComplete();
    }
}
window.addEventListener("load", function () {
    if (!infoProvider["dbgMode"])
        infoProvider.v2.setMinSize(0, 475);
    TweenMax.ticker.fps(25);
    windowLoaded = true;
    init();
});
//# sourceMappingURL=app.js.map