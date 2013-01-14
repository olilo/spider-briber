// define starting variables

var gates = {
    "gate1": {
        'open': false
        // TODO define position + width/height too for walk checking
    }
};
var player = {
    health: 100,
    points: 0,
    increment: {
        left: 0,
        top: 0
    },
    target: {
        left: 0,
        top: 0
    }
};
var keyboardIncrement = 10;


/* walkable area is a list of rectangles that define the outline
 * where the player can move. The rectangles are given as:
 * x, y, width, height  (x and y are the coordinates of the top-left point).
 * All values are given as multiples of 32 because the tiles are 32x32.
 */
var walkableArea = [
    [32 * 5.35, 32 * 84.5, 32 * 8.75, 32 * 7.6]
];

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

function spiderAttacks() {
    player.health -= 5;
    updateHUD();
}

function updateHUD() {
    jQuery(".health").html(player.health);
    jQuery(".points").html(player.points);
}

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
        player.target.left = mapPosition.left + playerOffsetX + e.pageX;
        player.target.top = -mapPosition.top + playerOffsetY + e.pageY;
        console.log(player.target.left + "--" + player.target.top);
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
        player.increment.left = 0;
        player.increment.top = 0;
    });

    setTimeout(tick, 100);

    // player move/"attack" logic
    function movePlayer(left, top) {
        // TODO also check that player can walk through an open door
        var isWalkable = false;
        for (var i = walkableArea.length - 1; i >= 0; i--) {
            var wx1 = walkableArea[i][0];
            var wy1 = walkableArea[i][1];
            var wx2 = wx1 + walkableArea[i][2];
            var wy2 = wy1 + walkableArea[i][3];
            console.log(wx1 + "/" + wy1 + " - " + wx2 + "/" + wy2);

            // clicked in proximity to wall? make life easier for the player
            if (left >= wx1 - 100 && left <= wx1) {
                left = wx1;
            } else if (left >= wx2 && left <= wx2 + 100) {
                left = wx2;
            }
            if (top >= wy1 - 100 && top <= wy1) {
                top = wy1;
            } else if (top >= wy2 && top <= wy2 + 100) {
                top = wy2;
            }

            // check whether click is inside area
            if (left >= wx1 && left <= wx2 && top >= wy1 && top <= wy2) {
                isWalkable = true;
            }
        }

        if (isWalkable) {
            var distance = Math.sqrt(Math.pow($player.position().left - left, 2) + Math.pow($player.position().top - top, 2));
            var duration = distance * 3;
            $player.stop().animate({left: left, top: top}, {easing: 'linear', duration: duration});
            player.target.left = left;
            player.target.top = top;
        } else {
            // TODO show an animated red x at cursor instead
            //alert("Not walkable");
        }
    }

    function tick() {
        var leftBase = $player.position().left;
        var topBase = $player.position().top;

        if (player.increment.left > 0 || player.increment.top > 0) {
            movePlayer(leftBase + player.increment.left, topBase + player.increment.top);
        } else if (player.target.left != leftBase || player.target.top != topBase) {
            movePlayer(player.target.left, player.target.top);
        }
    }

    setInterval(tick, 100);

});
