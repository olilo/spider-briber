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

    jQuery('.music').click(function() {
        var audio = jQuery(this).find('.player_audio').get(0);
        if (audio.paused == false) {
            audio.pause();
            jQuery(this).addClass('off');
        } else {
            audio.play();
            jQuery(this).removeClass('off');
        }
    });

    jQuery(".lost").hide();
    jQuery(".won").hide();
    jQuery(".paused").hide();
    Game.graphics = new Graphics(jQuery(".playingfield"));


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
