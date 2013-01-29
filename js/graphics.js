/*
 * This is a very, very basic abstraction over canvas, as much as i need for now.
 * It provides fallbacks for older browsers where possible (with no guarantee
 * for good performance).
 */

// Element that should be used to add to the Graphics object (see below)
function GameElement(url, x, y, width, height, translate) {
    this.url = url;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    if (translate) {
        this.sx = translate.sx;
        this.sy = translate.sy;
    } else {
        this.sx = null;
        this.sy = null;
    }
}

GameElement.prototype.translate = function(xDelta, yDelta) {
    if (this.sx === null) this.sx = 0;
    if (this.sy === null) this.sy = 0;
    this.sx += xDelta;
    this.sy += yDelta;
};

GameElement.prototype.move = function(xDelta, yDelta) {
    this.x += xDelta;
    this.y += yDelta;
};

// Graphics object
function Graphics(container) {
    var $container = jQuery(container);
    console.log($container);
    this.width = $container.width();
    this.height = $container.height();
    this.elements = [];
    this.onTopElements = 0;

    if (Modernizr.canvas) {
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        $container.append(canvas);
        this.context = canvas.getContext("2d");
        this.container = canvas;
        console.log(canvas);
    } else {
        this.container = $container;
    }
}

Graphics.prototype.reset = function() {
    this.elements = [];
    this.onTopElements = 0;
};

Graphics.prototype.addElement = function(element, attrs)  {
    if (attrs && attrs.alwaysOnTop) {
        this.onTopElements += 1;
        this.elements.push(element);
    } else {
        this.elements.splice(this.elements.length - this.onTopElements, 0, element);
    }
    if (Modernizr.canvas) {
        var img = new Image();
        img.src = element.url;
        element.canvasImg = img;
        element.loaded = false;
        jQuery(".loader").show();
        var graphicsWrap = this;
        img.onload = function() {
            element.loaded = true;
            for (var i = 0; i < graphicsWrap.elements.length; i++) {
                if (!graphicsWrap.elements[i].loaded) {
                    return;
                }
            }
            jQuery(".loader").hide();
        };
        // TODO add listener for image loaded
    } else {
        var span = document.createElement("span");
        span.id = "element" + (this.elements.length - 1);
        span.style.position = "absolute";
        span.style.backgroundImage = "url(" + element.url + ")";
        span.style.left = element.x;
        span.style.top = element.y;
        if (element.sx) {
            span.style.backgroundPosition = -element.sx + "px " + -element.sy + "px";
        }
        this.container.appendChild(span);
    }
};

Graphics.prototype.redraw = function() {
    var i, elem;
    if (Modernizr.canvas) {
        // possible optimisation: only redraw what has changed
        this.context.clearRect(0, 0, this.width, this.height);
        for (i = 0; i < this.elements.length; i++) {
            elem = this.elements[i];
            if (!elem.canvasImg.complete) continue;
            if (elem.sx !== null) {
                this.context.drawImage(elem.canvasImg, elem.sx, elem.sy, elem.width, elem.height,
                                                       elem.x, elem.y, elem.width, elem.height);
            } else {
                this.context.drawImage(elem.canvasImg, elem.x, elem.y, elem.width, elem.height);
            }
        }
    } else {
        // TODO fallback using <img> and css
        for (i = 0; i < this.elements.length; i++) {
            elem = this.elements[i];
            var span = document.getElementById("element" + i);
            span.style.left = elem.x;
            span.style.top = elem.y;
            if (elem.sx !== null) {
                span.style.backgroundPosition = elem.sx + "px " + elem.sy + "px";
            }
        }
    }
};
