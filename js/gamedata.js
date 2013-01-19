var gates = [
    {
        open: false,
        element: new GameElement("img/Castle_2.png", 308, 24, 56, 96, {sx: 340, sy: 96})
    }
];

/* walkable area is a list of rectangles that define the outline
 * where the player can move. The rectangles are given as:
 * x, y, width, height  (x and y are the coordinates of the top-left point).
 * All values are given as multiples of 32 because the tiles are 32x32.
 */
var walkableArea = [
    {x: 32 * 15.25, y: 32 * 74.2, width: 32 * 8.9, height: 32 * 8}
];
