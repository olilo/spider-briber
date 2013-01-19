jQuery(function() {
    var Game = {
        fps: 30,
        elements: [],
        graphics: new Graphics(jQuery(".playingfield")),
        background: new GameElement("img/background.png", 0, 0, 800, 600),
        towerOverlay: new GameElement("img/towers.png", 0, 0, 800, 600),
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

    Game.background.translate(320, 2280);
    Game.towerOverlay.translate(320, 2280);
    Game.graphics.addElement(Game.background);
    Game.graphics.addElement(Game.towerOverlay, {alwaysOnTop: true});


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
    function moveMapDownAndUp() {
        jQuery(".map").animate({top: -2000}, 5000, moveUp);
        function moveUp() {
            jQuery(".map").animate({top: -2600}, 5000);
        }
    }

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

/*
jQuery(function() {
    // init variables
    var $player = jQuery(".player");
    var playingField = jQuery(".playingfield");
    var playerWidth = $player.width();
    var playerHeight = $player.height();
    var playerOffsetX = - playingField.offset().left - playerWidth / 2;
    var playerOffsetY = - playingField.offset().top - playerHeight / 2;
    var map = jQuery(".map");
    player.target.left = $player.position().left;
    player.target.top = $player.position().top;

    updateHUD();

    // some debug functions to test level
    jQuery(".debug_animate_level").bind('click', function() {
        moveMapDownAndUp();
        return false;
    });
    jQuery(".debug_open_gate").bind('click', function() {
        openGate("gate1");
        return false;
    });
    jQuery(".debug_close_gate").bind('click', function() {
        closeGate("gate1");
        return false;
    });

    playingField.bind('click', function(e) {
        var mapPosition = map.position();
        var clickedLeft = mapPosition.left + playerOffsetX + e.pageX;
        var clickedTop = -mapPosition.top + playerOffsetY + e.pageY;
        var hitSpider = false;
        jQuery(".spider").each(function(i, elem) {
            var $spider = jQuery(elem);
            console.log($spider.position().left + "-" + ($spider.position().left + $spider.width()) + "/" +
                $spider.position().top + "-" + ($spider.position().top + $spider.height()) +
                "  " + clickedLeft + "/" + clickedTop
            );
            if ($spider.position().left <= clickedLeft && clickedLeft <= $spider.position().left + $spider.width()
                && $spider.position().top <= clickedTop && clickedTop <= $spider.position().top + $spider.height()) {
                hitSpider = true;
            }
        });
        if (hitSpider) {
            // we clicked on a spider: throw money at spider and stop mouse movement
            console.log("Clicked on spider at " + e.pageX + ", " + e.pageY);
            player.target.left = 0;
            player.target.top = 0;
        } else {
            player.target.left = clickedLeft;
            player.target.top = clickedTop;
            console.log(player.target.left + "--" + player.target.top);
        }
    });

    jQuery("body").bind('keydown', function(e) {
        switch(e.which) {
            case 37:
            case 65:
                // left arrow or 'a'
                player.increment.left = -keyboardIncrement;
                break;
            case 38:
            case 87:
                // up arrow or 'w'
                player.increment.top = -keyboardIncrement;
                break;
            case 39:
            case 68:
                // right arrow or 'd'
                player.increment.left = keyboardIncrement;
                break;
            case 40:
            case 83:
                // down arrow or 's'
                player.increment.top = keyboardIncrement;
                break;
            default:
                // no recognized keyboard shortcut
                break;
        }
    }).bind("keyup", function(e) {
        switch(e.which) {
            case 37:
            case 65:
            case 39:
            case 68:
                // left arrow, right arrow, 'a' or 'd'
                player.increment.left = 0;
                break;
            case 38:
            case 87:
            case 40:
            case 83:
                // up arrow, down arrow, 'w' or 's'
                player.increment.top = 0;
                break;
        }
    });

    function tick() {
        var leftBase = $player.position().left;
        var topBase = $player.position().top;

        if (player.increment.left != 0 || player.increment.top != 0) {
            player.move(leftBase + player.increment.left, topBase + player.increment.top);
        } else if ((player.target.left != leftBase || player.target.top != topBase) &&
            (player.target.left != 0 && player.target.top != 0)) {
            player.move(player.target.left, player.target.top);
        }
    }

    setInterval(tick, 1000 / 30);

});
*/
