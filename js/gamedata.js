var gates = {
    "gate1": {
        open: false,
        // TODO define position + width/height too for walk checking
        element: GameElement("img/...", 0, 0, 32, 32),
        opensWalkableAreas: [1]
    }
};

/* walkable area is a list of rectangles that define the outline
 * where the player can move. The rectangles are given as:
 * x, y, width, height  (x and y are the coordinates of the top-left point).
 * All values are given as multiples of 32 because the tiles are 32x32.
 */
var walkableArea = [
    {x: 32 * 15.25, y: 32 * 74.2, width: 32 * 8.9, height: 32 * 8}
];
