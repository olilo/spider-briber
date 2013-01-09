jQuery(function() {
    function moveDown() {
        jQuery(".map").animate({top: 500}, 5000, moveUp);
    }
    function moveUp() {
        jQuery(".map").animate({top: 0}, 5000);
    }
    moveDown();
});
