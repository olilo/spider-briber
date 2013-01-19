jQuery(function() {
    var Game = {
        fps: 30,
        elements: [],
        graphics: new Graphics(jQuery(".playingfield")),
        background: new GameElement("img/background.png", 0, 0, 800, 600, {sx: 320, sy: 2280}),
        towerOverlay: new GameElement("img/towers.png", 0, 0, 800, 600, {sx: 320, sy: 2280}),
        addObject: function(object) {
            Game.elements.push(object);
            Game.graphics.addElement(object.element);
        },
        update: function() {
            for (var i = 0; i < Game.elements.length; i++) {
                Game.elements[i].update();
            }
            updateHUD();
        }
    };

    Game.graphics.addElement(Game.background);
    Game.graphics.addElement(Game.towerOverlay, {alwaysOnTop: true});

    for (var i = 0; i < gates.length; i++) {
        Game.graphics.addElement(gates[i].element);
    }

    // player logic
    function Player() {
        this.health = 100;
        this.points = 0;
        this.element = new GameElement("img/player.gif", 350, 250, 50, 50);
        this.speed = 10;
        this.target = {left: 0, top: 0};
        this.moneyTarget = {left: 0, top: 0};
    }

    Player.prototype.update = function() {
        // TODO decide whether: clicked on spider, typed on keyboard, etc.
        var increment = {x: 0, y: 0};
        if (keyPressed(keys.up)) increment.y = -this.speed;
        if (keyPressed(keys.down)) increment.y = this.speed;
        if (keyPressed(keys.left)) increment.x = -this.speed;
        if (keyPressed(keys.right)) increment.x = this.speed;

        if (increment.x != 0 || increment.y != 0) {
            this.move(increment.x, increment.y);
        }
    };

    Player.prototype.move = function(xDelta, yDelta) {
        // TODO also check that player can walk through an open door
        var isWalkable = false;
        var xNew = Game.background.sx + this.element.x + xDelta,
            yNew = Game.background.sy + this.element.y + yDelta;
        for (var i = walkableArea.length - 1; i >= 0; i--) {
            var wx1 = walkableArea[i].x;
            var wy1 = walkableArea[i].y;
            var wx2 = wx1 + walkableArea[i].width;
            var wy2 = wy1 + walkableArea[i].height;

            // check whether target is inside area
            if (xNew > wx1 && xNew < wx2 && yNew > wy1 && yNew < wy2) {
                isWalkable = true;
                break;
            }
        }

        if (isWalkable) {
            Game.background.translate(xDelta, yDelta);
            Game.towerOverlay.translate(xDelta, yDelta);
            //this.element.move(xDelta, yDelta);
        }
    };

    var player = new Player();
    Game.addObject(player);


    // debug functions ... have to be updated to still be valid
    function openGate(id) {
        jQuery("#" + id).hide('slow', function() {
            jQuery(this).removeClass("gate-closed").addClass("gate-open").show();
            gates[id].open = true;
        });
    }

    function closeGate(id) {
        gates[id].open = false;
        jQuery("#" + id).hide().removeClass("gate-open").addClass("gate-closed").show('slow');
    }


    function Spider() {
        this.health = 20;
        this.bribed = false;
    }

    Spider.prototype.attack = function() {
        player.health -= 5;
        updateHUD();
    };

    function updateHUD() {
        jQuery(".health").html(player.health);
        jQuery(".points").html(player.points);
    }

    /*
     * Main game loop, first taken from:
     * http://buddylindsey.com/starting-an-html-5-tile-based-canvas-game-game-area-and-character/,
     * then adjusted like outlined here:
     * http://nokarma.org/2011/02/02/javascript-game-development-the-game-loop/index.html
     */
    Game.run = function(){
        var loops = 0, skipTicks = 1000 / Game.fps,
            maxFrameSkip = 10,
            nextGameTick = (new Date).getTime();

        return function() {
            loops = 0;

            while ((new Date).getTime() > nextGameTick && loops < maxFrameSkip) {
                Game.update();
                nextGameTick += skipTicks;
                loops++;
            }

            if (loops) Game.graphics.redraw();
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
