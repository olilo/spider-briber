var Game = {
    fps: 30,
    tileSize: 32,
    elements: [],
    graphics: null,  // is initialized when site is loaded
    background: new GameElement("img/background.png", 0, 0, 800, 600, {sx: 280, sy: 2320}),
    towerOverlay: new GameElement("img/towers.png", 0, 0, 800, 600, {sx: 280, sy: 2320}),
    playerElement: new GameElement("img/player.gif", 350, 250, 50, 50),
    spiderSprite: "img/spider_0.png",
    addObject: function(object) {
        Game.elements.push(object);
        Game.graphics.addElement(object.element);
    },
    gates: [
        new Gate(new GameElement("img/Castle_2.png", 328, -16, 96, 96, {sx: 320, sy: 96}))
    ]
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
    "",
    "",
    "",
    "", // 30
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "", // 40
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",  // 50
    "",
    "",
    "",
    "",
    "               xxxxxxxxxxxxxxxxxxxx  ",
    "               xxxxxxxxxxxxxxxxxxxx  ",
    "               xxxxxxxxx  ",
    "               xxxxxxxxx  ",
    "               xxxxxxxxx  ",
    "               xxxxxxxxx  ",  // 60
    "               xxxxxxxxx  ",
    "               xxxxxxxxx  ",
    "               xxxxxxxxx  ",
    "               xxxxxxxxx  ",
    "               xxxxxxxxx  ",
    "               xxxxxxxxx  ",
    "               xxxxxxxxx  ",
    "               xxxxxxxxx  ",
    "               xxxxxxxxx  ",
    "                  xxx     ",  // 70
    "                  xxx     ",
    "                  xxx     ",
    "                  xxx     ",
    "                  xxx     ",
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
