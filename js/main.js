jQuery(function() {
    // Game update function
    Game.update = function() {
        if (keyPressed(keys.pause)) {
            if (!Game.pausePressed) {
                window.cancelAnimationFrame(Game.animationFrameId);
                console.log("Paused");
                Game.pausePressed = true;
                jQuery(".paused").show();
                stepSleeping();
                return;
            }
        } else {
            Game.pausePressed = false;
        }

        // win/lose conditions
        if (Game.player.health <= 0) {
            window.cancelAnimationFrame(Game.animationFrameId);
            console.log("Lost");
            jQuery(".lost").show();
        }

        if (Game.tileSize * 52 <= Game.player.getMapPosX() && Game.player.getMapPosX() <= Game.tileSize * 85 &&
            Game.tileSize * 17 <= Game.player.getMapPosY() && Game.player.getMapPosY() <= Game.tileSize * 30) {

            window.cancelAnimationFrame(Game.animationFrameId);
            console.log("Won");
            jQuery(".won").show();
        }

        for (var i = 0; i < Game.elements.length; i++) {
            Game.elements[i].update();
        }
        Game.updateHUD();
    };
    Game.updateSleeping = function() {
        if (keyPressed(keys.pause)) {
            if (!Game.pausePressed) {
                window.cancelAnimationFrame(Game.sleepingFrameId);
                Game.nextGameTick = (new Date).getTime() + 200;
                Game.pausePressed = true;
                jQuery(".paused").hide();
                step();
            }
        } else {
            Game.pausePressed = false;
        }
    };
    Game.updateHUD = function() {
        jQuery(".health").html(Game.player.health).addClass(Game.player.health <= 25 ? "health-low" : "");
        jQuery(".money").html(Game.player.money).addClass(Game.player.money <= 1 ? "money-low" : "");
    };

    jQuery(".lost").hide();
    jQuery(".won").hide();
    jQuery(".paused").hide();
    Game.graphics = new Graphics(jQuery(".playingfield"));


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


    // debug functions
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
    // TODO if the user changes the tab then onEachFrame is not called anymore ... game should pause then
    (function(){
        Game.loops = 0;
        Game.skipTicks = 1000 / Game.fps;
        Game.maxFrameSkip = 10;
        Game.nextGameTick = (new Date).getTime();
        Game.lastDrawnFps = (new Date).getTime();
        Game.currentFps = 0;
    })();

    Game.tick = function() {
        Game.loops = 0;
        var time = (new Date).getTime();

        // quickfix for that tab change problem: drop all updates if time difference is > 10 seconds
        if (time - Game.nextGameTick > 10000) {
            Game.nextGameTick = time;
            console.log("More than 10sec difference between updates: Skipped all updates inbetween");
        }

        while (time > Game.nextGameTick && Game.loops < Game.maxFrameSkip) {
            Game.update();
            Game.nextGameTick += Game.skipTicks;
            Game.loops++;
        }

        if (Game.loops) {
            Game.graphics.redraw();
            if (Game.loops > 1) console.log("Skipped frames: " + (Game.loops - 1));
            Game.currentFps++;
        }

        if (time - Game.lastDrawnFps > 1000) {
            Game.lastDrawnFps = time;
            jQuery(".fps").html(Game.currentFps);
            Game.currentFps = 0;
        }
    };

    Game.tickSleeping = function() {
        Game.loops = 0;
        var time = (new Date).getTime();

        // quickfix for that tab change problem: drop all updates if time difference is > 10 seconds
        if (time - Game.nextGameTick > 10000) {
            Game.nextGameTick = time;
            console.log("More than 10sec difference between updates: Skipped all updates inbetween");
        }

        while (time > Game.nextGameTick && Game.loops < Game.maxFrameSkip) {
            Game.updateSleeping();
            Game.nextGameTick += Game.skipTicks;
            Game.loops++;
        }

        if (Game.loops) {
            Game.currentFps++;
        }

        if (time - Game.lastDrawnFps > 1000) {
            Game.lastDrawnFps = time;
            jQuery(".fps").html(Game.currentFps);
            Game.currentFps = 0;
        }
    };

    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame =
              window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());

    function step() {
        Game.animationFrameId = window.requestAnimationFrame(step);
        Game.tick();
    }

    function stepSleeping() {
        Game.sleepingFrameId = window.requestAnimationFrame(stepSleeping);
        Game.tickSleeping();
    }


    // initialize function
    Game.init = function() {
        Game.resetData();

        // graphics initialization
        Game.graphics.reset();
        Game.graphics.addElement(Game.background);
        Game.graphics.addElement(Game.towerOverlay, {alwaysOnTop: true});

        for (var i = 0; i < Game.gates.length; i++) {
            Game.addObject(Game.gates[i]);
        }

        Game.player = new Player();
        Game.addObject(Game.player);

        // add spiders
        Game.addObject(new Spider(16, 75));
        Game.addObject(new Spider(19, 64));
        Game.addObject(new Spider(18, 55));
        Game.addObject(new Spider(30, 55));
        Game.addObject(new Spider(40, 55));

        // bring some randomness into the play
        var generatedSpiders = 0;
        while(generatedSpiders < Game.randomSpiders) {
            var x = 34 + Math.floor(Math.random() * 41);
            var y = 40 + Math.floor(Math.random() * 31);
            if (walkableMap[y].charAt(x) == 'x') {
                Game.addObject(new Spider(x, y));
                generatedSpiders++;
            }
        }


        jQuery(".health").removeClass("health-low");
        jQuery(".money").removeClass("money-low");
        jQuery(".lost").hide();
        jQuery(".won").hide();
        jQuery(".paused").hide();

        step();
    };

    Game.init();
    jQuery(".playagain").bind('click', Game.init);

});
