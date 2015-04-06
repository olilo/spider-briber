var keysPressed = [];

// virtual key mapping
keys = {
    up: "up",
    down: "down",
    left: "left",
    right: "right",
    pause: "pause"
};

clickedAt = {
    x: 0,
    y: 0
};

function keyPressed(key) {
    return keysPressed.indexOf(key) >= 0;
}

jQuery("body").bind('keydown', function(e) {
    var keyToAdd = null;
    switch(e.which) {
        case 37:
        case 65:
            // left arrow or 'a'
            keyToAdd = keys.left;
            break;
        case 38:
        case 87:
            // up arrow or 'w'
            keyToAdd = keys.up;
            break;
        case 39:
        case 68:
            // right arrow or 'd'
            keyToAdd = keys.right;
            break;
        case 40:
        case 83:
            // down arrow or 's'
            keyToAdd = keys.down;
            break;
        case 19:
        case 80:
            keyToAdd = keys.pause;
            break;
        default:
            // no recognized keyboard shortcut
            break;
    }
    if (keysPressed.indexOf(keyToAdd) < 0) {
        keysPressed.push(keyToAdd);
    }
}).bind("keyup", function(e) {
    var keyToRemove = null;
    switch(e.which) {
        case 37:
        case 65:
            // left arrow or 'a'
            keyToRemove = keys.left;
            break;
        case 39:
        case 68:
            // right arrow or 'd'
            keyToRemove = keys.right;
            break;
        case 38:
        case 87:
            // up arrow or 'w'
            keyToRemove = keys.up;
            break;
        case 40:
        case 83:
            // down arrow or 's'
            keyToRemove = keys.down;
            break;
        case 19:
        case 80:
            keyToRemove = keys.pause;
            break;
        default:
            // nothing to do here ...
            break;
    }
    for (var i = 0; i < keysPressed.length; i++) {
        if (keysPressed[i] == keyToRemove) {
            keysPressed.splice(i, 1);
            break;
        }
    }
});

jQuery(".playingfield").bind('click', function(e) {
    offset = jQuery(".playingfield").offset();
    clickedAt.x = e.clientX - offset.left;
    clickedAt.y = parseInt(e.clientY - offset.top + $(document).scrollTop());
    console.log(clickedAt);
});
