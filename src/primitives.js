const SIDE_TYPES = {
    VALLEY: -1,
    FLAT: 0,
    MOUNTED: 1
};

class Point {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    distanceTo(point) {
        return new Vector(this, point).length();
    }

    static clone() {
        new Point(this.x, this.y);
    }
}

const CURVED_LINE = [
    0,  0,      35, 15,     37, 5,
    37, 5,      40, 0,      38, -5,
    38, -5,     20, -20,    50, -20,
    50, -20,    80, -20,    62, -5,
    62, -5,     60, 0,      63, 5,
    63, 5,      65, 15,     100, 0,
    100, 0
];

function tilePath(tile) {
    const tileWidth = tile.width;
    const tileHeight = tile.height;
    const top = CURVED_LINE
        .map((point, index) => index & 1 ? point * tile.top : point); // curve
    const right = CURVED_LINE
        .map((point, index) => index & 1 ? point * -tile.right : point) // curve
        .map((point, index) => index & 1 ? point + tileWidth : point) // shift
        .map((e, i, a) => i & 1 ? a[i - 1] : a[i + 1]); // rotate
    const bottom = CURVED_LINE
        .map((point, index) => index & 1 ? point * -tile.bottom : point) // curve
        .map((point, index) => index & 1 ? point + tileHeight : point) // shift
        .reverse().map((e, i, a) => i & 1 ? a[i - 1] : a[i + 1]); //rotate
    const left = CURVED_LINE
        .map((point, index) => index & 1 ? point * tile.left : point) // curve
        .reverse(); // rotate
    return [...top, ...right, ...bottom, ...left];
}

class Vector {
    constructor(start, end) {
        this.start = new Point(start.x, start.y);
        this.end = new Point(end.x, end.y);
    }

    get x() {
        return this.end.x - this.start.x;
    }

    get y() {
        return this.end.y - this.start.y;
    }

    length() {
        return Math.abs(Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2)));
    }
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

class Element {
    constructor(...elements) {
        this.id = makeid(7);
        elements.forEach(element => element.parent = this);
        this.elements = elements;
    }

    add(element) {
        const parent = element.parent;
        if (parent) {
            parent.remove(element);
        }
        element.parent = this;
        this.elements.push(element);
    }

    remove(element) {
        const index = this.elements.indexOf(element);
        if (index >= 0) {
            this.elements.splice(index, 1);
            element.parent = null;
        } else {
            throw new Error("element not found");
        }
    }
}

class Tile extends Element {
    constructor(position, index, width, height, sides) {
        super();
        if (position instanceof Point === false) {
            throw new Error('position must be a Point class');
        }
        if (Array.isArray(sides) === false || sides.length !== 4) {
            throw new Error('sides must be array with length 4');
        }
        this.position = position;
        this.index = index;
        this.width = width;
        this.height = height;
        this.sides = sides;
        this.isDragging = false;
    }

    set moveTo(position) {
        this.position = position;
    }

    set move(vector) {
        this.position = new Point(this.position.x + vector.x, this.position.y + vector.y);
    }

    get topLeft() {
        return this.position;
    }
    get topRight() {
        return new Point(this.position.x + this.width, this.position.y);
    }
    get bottomRight() {
        return new Point(this.position.x + this.width, this.position.y + this.height);
    }
    get bottomLeft() {
        return new Point(this.position.x, this.position.y + this.height);
    }

    /**
     * Sides start positions
     */
    get points() {
        return [
            this.topLeft,
            this.topRight,
            this.bottomRight,
            this.bottomLeft
        ];
    }

    get top() {
        return this.sides[0];
    }

    get right() {
        return this.sides[1];
    }

    get bottom() {
        return this.sides[2];
    }

    get left() {
        return this.sides[3];
    }

    get x() {
        return this.position.x;
    }

    get y() {
        return this.position.y;
    }

    set x(x) {
        this.position = new Point(x, this.y);
    }

    set y(y) {
        this.position = new Point(this.x, y);
    }
}

module.exports = {SIDE_TYPES, Point, tilePath, Vector, Element, Tile};
