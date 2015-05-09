// Gates
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


// player logic
function Player() {
    this.health = 100;
    this.money = Game.playerStartMoney;
    this.element = Game.playerElement;
    this.speed = Game.playerSpeed;
    this.lastClickedAt = {x: 0, y: 0};
    this.target = {x: this.getMapPosX(), y: this.getMapPosY()};
}

Player.prototype.getMapPosX = function() {
    return Game.background.sx + this.element.x;
};

Player.prototype.getMapPosY = function() {
    return Game.background.sy + this.element.y;
};

Player.prototype.update = function() {
    var increment = {x: 0, y: 0};
    if (keyPressed(keys.up)) increment.y = -this.speed;
    if (keyPressed(keys.down)) increment.y = this.speed;
    if (keyPressed(keys.left)) increment.x = -this.speed;
    if (keyPressed(keys.right)) increment.x = this.speed;

    // reset target to element position if key pressed
    if (increment.x != 0 || increment.y != 0) {
        this.target.x = this.getMapPosX();
        this.target.y = this.getMapPosY();
    }

    // clicked somewhere new
    if (clickedAt.x != this.lastClickedAt.x || clickedAt.y != this.lastClickedAt.y) {
        console.log("clicked at " + clickedAt.x + "/" + clickedAt.y);
        this.lastClickedAt.x = clickedAt.x;
        this.lastClickedAt.y = clickedAt.y;

        // if clicked on spider: bribe the spider
        var clickedOnSpider = false;
        if (this.money > 0) {
            for (var i = Game.elements.length - 1; i >= 0; i--) {
                var elem = Game.elements[i].element;
                if (Game.elements[i] instanceof Spider &&
                    clickedAt.x >= elem.x - 10 && clickedAt.x <= elem.x + elem.width + 20 &&
                    clickedAt.y >= elem.y - 10 && clickedAt.y <= elem.y + elem.height + 20 &&
                    !Game.elements[i].bribed) {

                    clickedOnSpider = true;
                    Game.elements[i].bribed = true;
                    Game.elements[i].bribedCountdown = Game.fps * 10;
                    this.money--;

                    // first bribery opens first gate
                    Game.gates[0].open();
                    break;
                }
            }
        }

        if (!clickedOnSpider) {
            this.target.x = Game.background.sx + clickedAt.x - this.element.width / 2;
            this.target.y = Game.background.sy + clickedAt.y - this.element.height / 2;
        }
    }
    // move to clicked mouse position
    var targetDiffX = this.target.x - this.getMapPosX();
    var targetDiffY = this.target.y - this.getMapPosY();
    if (targetDiffX != 0 || targetDiffY != 0) {
        //console.log(Math.min(targetDiffY, this.speed));
        increment.x = Math.max(-this.speed, Math.min(targetDiffX, this.speed));
        increment.y = Math.max(-this.speed, Math.min(targetDiffY, this.speed));
    }

    if (increment.x != 0 || increment.y != 0) {
        //console.log("Moving player by: " + increment.x + "/" + increment.y);
        this.move(increment.x, increment.y);
    }
};

Player.prototype.move = function(xDelta, yDelta) {
    var xDeltaOriginal = xDelta;
    //noinspection JSUnusedAssignment
    if (Game.checkMovable(this.element, xDelta, yDelta) ||
        Game.checkMovable(this.element, xDelta = 0, yDelta) ||
        Game.checkMovable(this.element, xDelta = xDeltaOriginal, yDelta = 0)) {

        Game.background.translate(xDelta, yDelta);
        Game.towerOverlay.translate(xDelta, yDelta);
        for (var i = 0; i < Game.gates.length; i++) {
            Game.gates[i].element.move(-xDelta, -yDelta);
        }

        // make player look in to direction of movement
        if (yDelta > 0) {
            this.element.sx = 64;
        } else if (yDelta < 0) {
            this.element.sx = 96;
        } else if (xDelta > 0) {
            this.element.sx = 0;
        } else if (xDelta < 0) {
            this.element.sx = 32;
        }
    }
};


// spiders ...
function Spider(xTile, yTile) {
    this.x = xTile * Game.tileSize;
    this.y = yTile * Game.tileSize;
    this.speed = Game.spiderSpeed;
    var elemX = - Game.background.sx + this.x;
    var elemY = - Game.background.sy + this.y;
    this.element = new GameElement(Game.spiderSprite, elemX, elemY, Game.spiderWidth, Game.spiderHeight, {sx: 45, sy: 66});
    this.animationCounter = 0;
    this.attackCooldown = 0;
    this.health = 20;
    this.bribed = false;
    this.bribedCountdown = 0;
    this.spottedPlayer = false;
}

Spider.prototype.getMapPosX = function() {
    return Game.background.sx + this.element.x;
};

Spider.prototype.getMapPosY = function() {
    return Game.background.sy + this.element.y;
};

Spider.prototype.update = function() {
    // reposition spider relative to background
    this.element.x = - Game.background.sx + this.x;
    this.element.y = - Game.background.sy + this.y;

    // turn to player
    var orientation = -1, // 0 - left; 1 - top-left; 2 - top; 3 - top-right ...
        turnThreshold = 45,
        xDistance = Game.player.getMapPosX() - this.x,
        yDistance = Game.player.getMapPosY() - this.y,
        xDelta = 0,
        yDelta = 0;

    this.animationCounter++;

    if (this.bribedCountdown-- < 0) {
        this.bribed = false;
    }

    // find out orientation
    if (xDistance < -turnThreshold && Math.abs(yDistance) <= turnThreshold) {
        orientation = 0;
    } else if (xDistance < -turnThreshold && yDistance < -turnThreshold) {
        orientation = 1;
    } else if (Math.abs(xDistance) <= turnThreshold && yDistance < -turnThreshold) {
        orientation = 2;
    } else if (xDistance > turnThreshold && yDistance < -turnThreshold) {
        orientation = 3;
    } else if (xDistance > turnThreshold && Math.abs(yDistance) <= turnThreshold) {
        orientation = 4;
    } else if (xDistance > turnThreshold && yDistance > turnThreshold) {
        orientation = 5;
    } else if (Math.abs(xDistance) <= turnThreshold && yDistance > turnThreshold) {
        orientation = 6;
    } else if (xDistance < -turnThreshold && yDistance > turnThreshold) {
        orientation = 7;
    } else {
        console.log("HALP: Unknown state for orientation!!");
    }

    /* simple AI: if player is in close (like, 4 tiles away), walk towards him and try to attack him
     *            we only let go if the player walks out of the visible screen area
     */
    var absDistance = Math.max(Math.abs(xDistance), Math.abs(yDistance));
    if (absDistance <= Game.tileSize && !this.bribed) {
        this.attack();
        if (orientation > -1) {
            this.element.sy = orientation * 128 + 64;
        }
        this.element.sx = Math.floor((this.animationCounter % 32) / 8) * 128 + 28 * 128 + 42;
    } else if (absDistance <= Game.tileSize * 5 || absDistance <= Game.tileSize * 14 && this.spottedPlayer) {
        xDelta = xDistance < -turnThreshold/2 ? -this.speed : xDistance > turnThreshold/2 ? this.speed : 0;
        yDelta = yDistance < -turnThreshold/2 ? -this.speed : yDistance > turnThreshold/2 ? this.speed : 0;
        this.spottedPlayer = true;

        // reverse move direction and orientation if bribed
        if (this.bribed) {
            xDelta = -xDelta;
            yDelta = -yDelta;
            orientation = (orientation + 4) % 8;
        }

        this.move(xDelta, yDelta);
        if (orientation > -1) {
            this.element.sy = orientation * 128 + 64;
        }
        this.element.sx = Math.floor((this.animationCounter % 32) / 4) * 128 + 4 * 128 + 42;
    } else {
        this.spottedPlayer = false;
        this.element.sx = Math.floor((this.animationCounter % 32) / 8) * 128 + 42;
    }
};

Spider.prototype.move = function(xDelta, yDelta) {
    var xDeltaOriginal = xDelta;
    if (Game.checkMovable(this.element, xDelta, yDelta) ||
        Game.checkMovable(this.element, xDelta = 0, yDelta) ||
        Game.checkMovable(this.element, xDelta = xDeltaOriginal, yDelta = 0)) {

        this.x += xDelta;
        this.y += yDelta;
    }
};

Spider.prototype.attack = function() {
    if (this.attackCooldown <= 0) {
        Game.player.health -= Game.spiderAttack;
        this.attackCooldown = Game.fps;
    }
    this.attackCooldown--;
    Game.updateHUD();
};
