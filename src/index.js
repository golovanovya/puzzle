'use strict';
import './style.css';

const SIDE_TYPES = {
    VALLEY: -1,
    FLAT: 0,
    MOUNTED: 1
};

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distanceTo(point) {
        return new Vector(this, point).length();
    }
}

class Vector {
    constructor(start, end) {
        this.start = start;
        this.end = end;
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

class Element {
    constructor(...elements) {
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
        this.position.x += vector.x;
        this.position.y += vector.y;
    }

    get topLeft() {
        return this.position;
    }
    get topRight() {
        return new Point(this.position.x + this.width, this.position.y);
    }
    get bottomLeft() {
        return new Point(this.position.x, this.position.y + this.height);
    }
    get topLeft() {
        return new Point(this.position.x + this.width, this.position.y + this.height);
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
}

class Group extends Element {
    merge(group) {
        if (this !== group) {
            group.elements.forEach(element => super.add(element));
        }
    }
}

class Grid extends Element {
    constructor() {
        super();
        this.tiles = [];
    }
}

function getRandomSide() {
    const rand = Math.round(Math.random());
    return rand === 0 ? SIDE_TYPES.MOUNTED : SIDE_TYPES.VALLEY;
}

const COLS = 3;
const ROWS = 3;
const TILE_SIZE = 100;
const TOLERANCE = 20;

const puzzleElement = document.createElement('div');
puzzleElement.className = 'puzzle';

const grid = new Grid();

for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
        const index = (i * COLS) + j;
        const position = new Point(j * TILE_SIZE + j * 50, i * TILE_SIZE + i * 50);
        const top = hasTop(i) ? grid.tiles[getTop(index, COLS)].bottom * -1 : SIDE_TYPES.FLAT;
        const right = hasRight(j, COLS) ? getRandomSide() : SIDE_TYPES.FLAT;
        const bottom = hasBottom(i, ROWS) ? getRandomSide() : SIDE_TYPES.FLAT;
        const left = hasLeft(j) ?  grid.tiles[index - 1].right * -1 : SIDE_TYPES.FLAT;
        const sides = [top, right, bottom, left];
        const tile = new Tile(position, index, TILE_SIZE, TILE_SIZE, sides);
        tile.i = i;
        tile.j = j;
        tile.element = drawTile(tile);
        tile.element.addEventListener('mouseover', mouseOverTile);
        tile.element.addEventListener('drag', (e) => {
            const moved = new Vector(tile.position, tile.element.position());
            moveTileWithGroup(moved, tile.parent);
        });
        tile.element.addEventListener('dragend', (e) => {
            const moved = new Vector(tile.position, tile.element.position());
            moveTileWithGroup(moved, tile.parent);
            testMatching(tile);
        });
        grid.tiles.push(tile);
        const group = new Group(tile);
        grid.add(group);
    }
}

function moveTileWithGroup(vector, group) {
    group.elements.forEach(item => item.move = vector);
    group.elements.forEach(redrawTile);
}

function testMatching(tile) {
    const checked = [];
    const checking = [...tile.parent.elements];
    while (checking.length > 0) {
        const current = checking.shift();
        checked.push(current);
        const index = current.index;
        const row = Math.floor(index / COLS);
        const col = index % COLS;
        if (hasTop(row)) {
            const top = grid.tiles[getTop(index, COLS)];
            if (checking.indexOf(top) >= 0 || checked.indexOf(top) > 0) {
                continue;
            }
            const distance = new Vector(top.bottomLeft, current.position);
            const length = distance.length();
            if (length <= TOLERANCE) {
                moveTileWithGroup(distance, top.parent);
                checking.push(...top.parent.elements);
                tile.parent.merge(top.parent);
            }
        }
    }
}

function redrawTile(tile) {
    tile.element.style.left = `${tile.position.x}px`;
    tile.element.style.top = `${tile.position.y}px`;
}

function hasTop(row) {
    return row !== 0;
}
function hasRight(col, cols) {
    return col !== cols - 1;
}
function hasBottom(row, rows) {
    return row !== rows - 1;
}
function hasLeft(col) {
    return col !== 0;
}
function getTop(index, cols) {
    return index - cols;
}
function getBottom(index, cols) {
    return index + cols;
}

function drawTile(tile) {
    const element = document.createElement('ul');
    element.className = 'puzzle__tile draggable';
    element.style = `top:${tile.position.y}px;left:${tile.position.x}px`;
    let tileContent = '';
    tileContent += `<li class="puzzle__tile-label puzzle__tile-label_top">${tile.top}</li>`;
    tileContent += `<li class="puzzle__tile-label puzzle__tile-label_left">${tile.left}</li>`;
    tileContent += `<li class="puzzle__tile-label puzzle__tile-label">${tile.index}</li>`;
    tileContent += `<li class="puzzle__tile-label puzzle__tile-label_right">${tile.right}</li>`;
    tileContent += `<li class="puzzle__tile-label puzzle__tile-label_bottom">${tile.bottom}</li>`;
    element.innerHTML = tileContent;
    element.position = function() {
        const x = parseInt(element.style.left);
        const y = parseInt(element.style.top);
        return new Point(x, y);
    }
    return element;
}

grid.tiles.forEach(tile => puzzleElement.append(tile.element));
document.querySelector('#puzzle').append(puzzleElement);

let isDragging = false;
function mouseOverTile(event){
    if (isDragging) return false;
    let dragElement = event.target.closest('.draggable');
    if (!dragElement) return;
    if (typeof dragElement.parentElement === 'undefined') return;
    const parent = dragElement.parentElement;

    parent.removeChild(dragElement);
    parent.append(dragElement);
    return false;
}

document.addEventListener('mousedown', function (event) {
    let dragElement = event.target.closest('.draggable');
    if (!dragElement) return;

    event.preventDefault();
    dragElement.ondragstart = function () {
        return false;
    };

    let coords, shiftX, shiftY;
    startDrag(dragElement, event.clientX, event.clientY);

    function onMouseUp(event) {
        finishDrag();
    };

    function onMouseMove(event) {
        moveTo(event.clientX, event.clientY);
    }

    // on drag start:
    //   remember the initial shift
    //   move the element position:fixed and a direct child of body
    function startDrag(element, clientX, clientY) {
        if (isDragging) {
            return;
        }

        isDragging = true;

        document.addEventListener('mousemove', onMouseMove);
        element.addEventListener('mouseup', onMouseUp);

        shiftX = clientX - element.getBoundingClientRect().left;
        shiftY = clientY - element.getBoundingClientRect().top;

        element.style.position = 'fixed';
        
        element.dispatchEvent(new Event('dragstart'));
        moveTo(clientX, clientY);
    };

    // switch to absolute coordinates at the end, to fix the element in the document
    function finishDrag() {
        if (!isDragging) {
            return;
        }

        isDragging = false;

        dragElement.style.top = parseInt(dragElement.style.top) + pageYOffset + 'px';
        dragElement.style.position = 'absolute';

        document.removeEventListener('mousemove', onMouseMove);
        dragElement.removeEventListener('mouseup', onMouseUp);
        dragElement.dispatchEvent(new Event('dragend'));
    }

    function moveTo(clientX, clientY) {
        // new window-relative coordinates
        let newX = clientX - shiftX;
        let newY = clientY - shiftY;

        // check if the new coordinates are below the bottom window edge
        let newBottom = newY + dragElement.offsetHeight; // new bottom

        // below the window? let's scroll the page
        if (newBottom > document.documentElement.clientHeight) {
            // window-relative coordinate of document end
            let docBottom = document.documentElement.getBoundingClientRect().bottom;

            // scroll the document down by 10px has a problem
            // it can scroll beyond the end of the document
            // Math.min(how much left to the end, 10)
            let scrollY = Math.min(docBottom - newBottom, 10);

            // calculations are imprecise, there may be rounding errors that lead to scrolling up
            // that should be impossible, fix that here
            if (scrollY < 0) scrollY = 0;

            window.scrollBy(0, scrollY);

            // a swift mouse move make put the cursor beyond the document end
            // if that happens -
            // limit the new Y by the maximally possible (right at the bottom of the document)
            newY = Math.min(newY, document.documentElement.clientHeight - dragElement.offsetHeight);
        }

        // check if the new coordinates are above the top window edge (similar logic)
        if (newY < 0) {
            // scroll up
            let scrollY = Math.min(-newY, 10);
            if (scrollY < 0) scrollY = 0; // check precision errors

            window.scrollBy(0, -scrollY);
            // a swift mouse move can put the cursor beyond the document start
            newY = Math.max(newY, 0); // newY may not be below 0
        }

        // limit the new X within the window boundaries
        // there's no scroll here so it's simple
        if (newX < 0) newX = 0;
        if (newX > document.documentElement.clientWidth - dragElement.offsetWidth) {
            newX = document.documentElement.clientWidth - dragElement.offsetWidth;
        }

        dragElement.style.left = `${newX}px`;
        dragElement.style.top = `${newY}px`;
        dragElement.dispatchEvent(new Event('drag'));
    }
});

window.grid = grid;