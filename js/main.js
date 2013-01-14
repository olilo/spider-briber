// define starting variables


var gates = {
    "gate1": {
        'open': false
        // TODO define position + width/height too for walk checking
    }
};

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
    jQuery("#" + id).hide().removeClass("gate-open").addClass("gate-closed");
    jQuery("#" + id).show('slow');
}

jQuery(function() {
    // init variables
    var player = jQuery(".player");
    var playerWidth = player.width();
    var playerHeight = player.height();
    var playerOffsetX = - jQuery(".playingfield").offset().left - playerWidth / 2;
    var playerOffsetY = - jQuery(".playingfield").offset().top - playerHeight / 2;
    var map = jQuery(".map");

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

    // player move/"attack" logic
    jQuery(".playingfield").bind('click', function(e) {
        // TODO check that player can walk where we clicked
        var mapPosition = map.position();
        var left = mapPosition.left + playerOffsetX + e.pageX;
        var top = -mapPosition.top + playerOffsetY + e.pageY;
        console.log(left + "--" + top);

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
            player.stop().animate({left: left, top: top});
        } else {
            // TODO show an animated red x at cursor instead
            //alert("Not walkable");
        }
    });

});
