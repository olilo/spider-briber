function moveMapDownAndUp() {
    jQuery(".map").animate({top: -2000}, 5000, moveUp);
    function moveUp() {
        jQuery(".map").animate({top: -2600}, 5000);
    }
}

gates = {
    "gate1": false
};

function openGate(id) {
    jQuery("#" + id).hide('slow');
    gates[id] = true;
}

function closeGate(id) {
    jQuery("#" + id).show(500);
    gates[id] = false;
}

jQuery(function() {
    jQuery(".debug_animate_level").click(function() {
        moveMapDownAndUp();
        return false;
    });
    jQuery(".debug_open_gate").click(function() {
        openGate("gate1");
        return false;
    });
    jQuery(".debug_close_gate").click(function() {
        closeGate("gate1");
        return false;
    });

});
