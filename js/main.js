jQuery(function() {
    // Game update function
    Game.update = function() {
        for (var i = 0; i < Game.elements.length; i++) {
            Game.elements[i].update();
        }
        Game.updateHUD();
    };
    Game.updateHUD = function() {
        jQuery(".health").html(player.health).addClass(player.health <= 25 ? "health-low" : "");
        jQuery(".money").html(player.money);
    };

    // graphics initialization
    Game.graphics = new Graphics(jQuery(".playingfield"));
    Game.graphics.addElement(Game.background);
    Game.graphics.addElement(Game.towerOverlay, {alwaysOnTop: true});

    for (var i = 0; i < Game.gates.length; i++) {
        Game.addObject(Game.gates[i]);
    }

    // player logic
    function Player() {
        this.health = 100;
        this.money = 1000;
        this.element = Game.playerElement;
        this.speed = Game.playerSpeed;
        this.lastClickedAt = {x: 0, y: 0};
        this.target = {x: this.getMapPosX(), y: this.getMapPosY()};
        this.moneyTarget = {x: 0, y: 0};
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
            this.lastClickedAt.x = clickedAt.x;
            this.lastClickedAt.y = clickedAt.y;
            this.target.x = Game.background.sx + clickedAt.x - this.element.width / 2;
            this.target.y = Game.background.sy + clickedAt.y - this.element.height / 2;
        }

        // move to clicked mouse position
        // TODO decide whether: clicked on spider or on an open tile
        var targetDiffX = this.target.x - this.getMapPosX();
        var targetDiffY = this.target.y - this.getMapPosY();
        if (targetDiffX != 0 || targetDiffY != 0) {
            console.log(Math.min(targetDiffY, this.speed));
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
        if (Game.checkMovable(this.element, xDelta, yDelta) ||
            Game.checkMovable(this.element, xDelta = 0, yDelta) ||
            Game.checkMovable(this.element, xDelta = xDeltaOriginal, yDelta = 0)) {

            Game.background.translate(xDelta, yDelta);
            Game.towerOverlay.translate(xDelta, yDelta);
            for (i = 0; i < Game.gates.length; i++) {
                Game.gates[i].element.move(-xDelta, -yDelta);
            }
        }
    };

    var player = new Player();
    Game.addObject(player);


    // spiders ...
    function Spider(xTile, yTile) {
        this.x = xTile * Game.tileSize;
        this.y = yTile * Game.tileSize;
        this.speed = Game.spiderSpeed;
        var elemX = - Game.background.sx + this.x;
        var elemY = - Game.background.sy + this.y;
        this.element = new GameElement(Game.spiderSprite, elemX, elemY, Game.spiderWidth, Game.spiderHeight, {sx: 45, sy: 66});
        this.animationCounter = 0;
        this.health = 20;
        this.bribed = false;
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
            xDistance = player.getMapPosX() - this.x,
            yDistance = player.getMapPosY() - this.y,
            xDelta = 0,
            yDelta = 0;

        this.animationCounter++;

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
        if (absDistance <= Game.tileSize) {
            this.attack();
            if (orientation > -1) {
                this.element.sy = orientation * 128 + 64;
            }
            this.element.sx = Math.floor((this.animationCounter % 32) / 8) * 128 + 28 * 128 + 42;
        } else if (absDistance <= Game.tileSize * 5 || absDistance <= Game.tileSize * 14 && this.spottedPlayer) {
            xDelta = xDistance < -turnThreshold/2 ? -this.speed : xDistance > turnThreshold/2 ? this.speed : 0;
            yDelta = yDistance < -turnThreshold/2 ? -this.speed : yDistance > turnThreshold/2 ? this.speed : 0;
            this.spottedPlayer = true;
            this.move(xDelta, yDelta);
            if (orientation > -1) {
                this.element.sy = orientation * 128 + 64;
            }
            this.element.sx = Math.floor((this.animationCounter % 32) / 4) * 128 + 4 * 128 + 42;
        } else {
            this.spottedPlayer = false;
            this.element.sx = Math.floor((this.animationCounter % 32) / 8) * 128 + 42;
        }

        // TODO if bribed: go away into a corner and don't act for some time (10 seconds? 20 seconds?)
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
        if (this.animationCounter % 32 == 0) {
            player.health -= 5;
        }
        Game.updateHUD();
    };

    // add two debug spiders, one inside the room and one outside
    Game.addObject(new Spider(16, 75));
    Game.addObject(new Spider(19, 64));


    // debug functions ... have to be updated to still be valid
    jQuery(".debug_open_gate").bind('click', function() {
        Game.gates[0].open();
        return false;
    });


    /*
     * Main game loop, first taken from:
     * http://buddylindsey.com/starting-an-html-5-tile-based-canvas-game-game-area-and-character/,
     * then adjusted like outlined here:
     * http://nokarma.org/2011/02/02/javascript-game-development-the-game-loop/index.html
     */
    // TODO if the player changes the tab then onEachFrame is not called anymore ... game should pause then
    Game.run = function(){
        var loops = 0, skipTicks = 1000 / Game.fps,
            maxFrameSkip = 10,
            nextGameTick = (new Date).getTime();

        return function() {
            loops = 0;

            // quickfix for that tab change problem: drop all updates if time difference is > 10 seconds
            if ((new Date).getTime() - nextGameTick > 10000) {
                nextGameTick = (new Date).getTime();
                console.log("More than 10sec difference between updates: Skipped all updates inbetween");
            }

            while ((new Date).getTime() > nextGameTick && loops < maxFrameSkip) {
                Game.update();
                nextGameTick += skipTicks;
                loops++;
            }

            if (loops) {
                Game.graphics.redraw();
                if (loops > 1) console.log("Skipped frames: " + (loops - 1));
            }
        };
    };

    (function() {
        var onEachFrame;
        if (window.webkitRequestAnimationFrame) {
            console.log("webkitRequestAnimationFrame present, using it");
            onEachFrame = function(cb) {
                var _cb = function() { cb(); webkitRequestAnimationFrame(_cb); };
                _cb();
            };
        } else if (window.mozRequestAnimationFrame) {
            console.log("mozRequestAnimationFrame present, using it");
            onEachFrame = function(cb) {
                var _cb = function() { cb(); mozRequestAnimationFrame(_cb); };
                _cb();
            };
        } else {
            console.log("Fallback to setInterval");
            onEachFrame = function(cb) {
                setInterval(cb, 1000 / 60);
            }
        }

        window.onEachFrame = onEachFrame;
    })();

    window.onEachFrame(Game.run());

});
