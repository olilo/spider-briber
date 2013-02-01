var Game = {
    fps: 30,
    tileSize: 32,
    graphics: null,  // is initialized when site is loaded
    randomSpiders: 20,
    spiderSprite: "img/spider_0.png",
    spiderWidth: 45,
    spiderHeight: 45,
    spiderAttack: 10,
    spiderSpeed: 1.3,
    playerSpeed: 5,
    playerStartMoney: 10,
    addObject: function(object) {
        Game.elements.push(object);
        Game.graphics.addElement(object.element);
    },
    checkMovable: function(element, xDelta, yDelta) {
        var xNew = Game.background.sx + element.x + xDelta,
            yNew = Game.background.sy + element.y + yDelta,
            xTile = Math.floor((xNew - 10) / Game.tileSize),
            yTile = Math.floor((yNew) / Game.tileSize),
            isWalkable = walkableMap[yTile].charAt(xTile) == 'x';

        // check gates
        if (isWalkable) {
            for (var i = 0; i < Game.gates.length; i++) {
                // check that the middle of the player does not hit this gate
                if (Game.gates[i].hitTest(xNew + element.width / 2, yNew + element.height / 2)) {
                    return false;
                }
            }
        }

        return isWalkable;
    }
};

Game.resetData = function() {
    this.elements = [];
    this.background = new GameElement("img/background.png", 0, 0, 800, 600, {sx: 280, sy: 2320});
    this.towerOverlay = new GameElement("img/towers.png", 0, 0, 800, 600, {sx: 280, sy: 2320});
    this.playerElement = new GameElement("img/player.gif", 350, 250, 50, 50);
    this.gates = [
        new Gate(new GameElement("img/Castle_2.png", 328, -16, 96, 96, {sx: 320, sy: 96}))
        //new Gate(new GameElement("img/Castle_2.png", 1928, -1136, 96, 96, {sx: 320, sy: 96}))
    ];
    this.gateOpener = [
        {
            x: 55 * Game.tileSize,
            y: 55 * Game.tileSize,
            width: Game.tileSize,
            height: Game.tileSize,
            opens: 1
        }
    ];
};


function Gate(element) {
    this.isOpen = false;
    this.element = element;
    this.isOpening = false;
}

Gate.prototype.update = function() {
    if (this.isOpening) {
        if (this.element.height > 0) {
            this.element.height -= 2;
        } else {
            this.element.height = 0;
            this.isOpening = false;
            this.isOpen = true;
            // TODO change element on graphics to the open element
        }
    }
};

Gate.prototype.hitTest = function(x, y) {
    if (this.isOpen) {
        return false;
    }

    var gateLeft = this.element.x + Game.background.sx,
        gateRight = gateLeft + this.element.width,
        gateTop = this.element.y + Game.background.sy,
        gateBottom = gateTop + this.element.height - 8;

    return gateLeft < x && x < gateRight && gateTop < y && y < gateBottom;
};

Gate.prototype.open = function() {
    this.isOpening = true;
};

/*
 * walkable tiles as a map. x marks where character can walk.
 */

var walkableMap = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "", // 10
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "", // 20
    "",
    "",
    "",
    "",
    "",
    "",
    "                                                    xxxxxx xxxxxxxxx xxxx  ",
    "                                                    xxx xx xxxxxxxxx xx xxx  ",
    "                                                    xxx xxxx  xxx  xxxx xxx  ",
    "                                                    xxxxxxxxxxxxxxxxxxxxxxx  ", // 30
    "                                                    xxxxxxxxxxxxxxxxxxxxxxx  ",
    "                                                    xxxxxxxxxxxxxxxxxxxx  x  ",
    "                                                    xxxxxxx xxxxxxxxxxxxxxx  ",
    "                                                    xxxxxxxxxxxxxxxxxxxxxxx  ",
    "                                                                    xxx  ",
    "                                                                    xxx  ",
    "                                                                    xxx  ",
    "                                                                    xxx  ",
    "                                                                    xxx  ",
    "                                                    xxxxxxxxxxxxxxxxxxxxxxx  ", // 40
    "                                                    xxxxxxxxxxxxxxxxxxxxxxx  ",
    "                                                    xxxxxxxxxxxxxxxxxxxxxxx  ",
    "                                                    xxxx        xxxxxxxxxxx  ",
    "                                                    xxxx        xxxxxxxxxxx  ",
    "                                                    xxxx        xxxxxxxxxxx  ",
    "                                                    xxxx        xxxxxxxxxxx  ",
    "                                                    xxxx        xxxxxxxxxxx  ",
    "                                                    xxxx        xxxxxxxxxxx  ",
    "                                                    xxxx        xxxxxxxxxxx  ",
    "                                                    xxxx            xxx  ",  // 50
    "                                                    xxxx            xxx  ",
    "                                                    xxxx            xxx  ",
    "                                                    xxxx            xxx  ",
    "                                                    xxxx            xxx  ",
    "               xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  ",
    "               xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  ",
    "               xxxxxxxxx                            xxxx            xxx  ",
    "               xxxxxxxxx                            xxxx            xxx  ",
    "               xxxxxxxxx                            xxxx            xxx  ",
    "               xxxxxxxxx                            xxxx            xxx  ",  // 60
    "               xxxxxxxxx                            xxxx            xxx  ",
    "               xxxxxxxxx                            xxxx        xxxxxxxxxxx  ",
    "               xxxxxxxxx                            xxxx        xxxxxxxxxxx  ",
    "               xxxxxxxxx                            xxxx        xxxxxxxxxxx  ",
    "               xxxxxxxxx                            xxxx        xxxxxxxxxxx  ",
    "               xxxxxxxxx                            xxxx        xxxxxxxxxxx  ",
    "               xxxxxxxxx                            xxxx        xxxxxxxxxxx  ",
    "               xxxxxxxxx                            xxxx        xxxxxxxxxxx  ",
    "               xxxxxxxxx                            xxxxxxxxxxxxxxxxxxxxxxx  ",
    "                  xx                                xxxxxxxxxxxxxxxxxxxxxxx  ",  // 70
    "                  xx                                xxxxxxxxxxxxxxxxxxxxxxx  ",
    "                  xx      ",
    "                  xx      ",
    "                  xx      ",
    "               xxxxxxxxx  ",
    "               xxxxxxxxx  ",
    "               xxxxxxxxx  ",
    "               xxxxxxxxx  ",
    "               x   xxxxx  ",
    "               x   xxxxx  ",  // 80
    "               xx  xxxxx  ",
    "               xx  xxxxx  ",
    "               xxxxxxxxx  ",
    "",
    "",
    "",
    "",
    "",
    "",
    "",  // 90
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""  // 100
];
