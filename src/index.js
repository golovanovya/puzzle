'use strict';
import './style.css';

const VALLEY = -1;
const FLAT = 0;
const MOUNTED = 1;

function getRandomSide() {
    const rand = Math.round(Math.random());
    return rand === 0 ? MOUNTED : VALLEY;
}

const tiles = [];
const cols = 3;
const rows = 3;
const tileSize = 100;
const tolerance = 20;

const puzzleElement = document.createElement('div');
puzzleElement.className = 'puzzle';
const puzzle = {
    element: puzzleElement,
    tiles: tiles
};

let tileGroups = [];

for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
        const tile = {};
        const group = [];
        const index = (i * cols) + j;
        tile.i = i;
        tile.j = j;
        tile.index = index;
        tile.x = tile.j * tileSize + tile.j * 50;
        tile.y = tile.i * tileSize + tile.i * 50;
        tile.top = hasTop(i) ? tiles[getTop(index, cols)].bottom * -1 : FLAT;
        tile.right = hasRight(j, cols) ? getRandomSide() : FLAT;
        tile.bottom = hasBottom(i, rows) ? getRandomSide() : FLAT;
        tile.left = hasLeft(j) ?  tiles[index - 1].right * -1 : FLAT;
        tile.element = drawTile(tile);
        tile.element.addEventListener('mouseover', mouseOverTile);
        tile.element.addEventListener('tile_drag', (e) => {
            moveTileWithGroup(tile);
        });
        tile.element.addEventListener('tile_finishdrag', (e) => testMatching(tile));
        tiles.push(tile);
        tile.group = group;
        group.push(tile);
        tileGroups.push(group);
    }
}

function moveTileWithGroup(tile) {
    const x = parseInt(tile.element.style.left);
    const y = parseInt(tile.element.style.top);
    const shiftX = x - tile.x;
    const shiftY = y - tile.y;
    for (let i = 0; i < tile.group.length; i++) {
        const current = tile.group[i];
        current.x += shiftX;
        current.y += shiftY;
        redrawTile(current);
    }
}

function testMatching() {
    let moved = false;
    let matched = 0;
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        if (hasLeft(tile.j)) {
            const left = tiles[tile.index - 1];
            if (left.group !== tile.group) {
                const distance = length(tile.x, tile.y, left.x + tileSize, left.y);
                if (distance <= tolerance) {
                    if (distance > 0) {
                        left.x = tile.x - tileSize;
                        left.y = tile.y;
                        redrawTile(left);
                        moved = true;
                    }
                    console.log('left match');
                    changeGroup(left, tile);
                    matched++;
                }
            }
        }
        if (hasTop(tile.i)) {
            const top = tiles[getTop(tile.index, cols)];
            if (top.group !== tile.group) {
                const distance = length(tile.x, tile.y, top.x, top.y + tileSize);
                if (distance <= tolerance) {
                    if (distance > 0) {
                        top.x = tile.x;
                        top.y = tile.y - tileSize;
                        redrawTile(top);
                        moved = true;
                    }
                    console.log('top match');
                    changeGroup(top, tile);
                    matched++;
                }
            }
        }
    }
    console.log(`matched ${matched}`);
    if (moved) {
        testMatching();
    } else if (tileGroups.length === 1) {
        setTimeout(() => alert('puzzle assembled'), 1);
    }
}

function redrawTile(tile) {
    tile.element.style.left = `${tile.x}px`;
    tile.element.style.top = `${tile.y}px`;
}

function changeGroup(from, to) {
    to.group.push(from);
    from.group.splice(from.group.indexOf(from), 1);
    // delete empty group
    if (from.group.length < 1) {
        tileGroups.splice(tileGroups.indexOf(from.group), 1);
    }
    from.group = to.group;
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
/**
 * Distance between two coords
 * @param {int} x1 
 * @param {int} y1 
 * @param {int} x2 
 * @param {int} y2 
 */
function length(x1, y1, x2, y2) {
    return Math.abs(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
}

function drawTile(tile) {
    const element = document.createElement('ul');
    element.className = 'puzzle__tile draggable';
    element.style = `top:${tile.y}px;left:${tile.x}px`;
    let tileContent = '';
    tileContent += `<li class="puzzle__tile-label puzzle__tile-label_top">${tile.top}</li>`;
    tileContent += `<li class="puzzle__tile-label puzzle__tile-label_left">${tile.left}</li>`;
    tileContent += `<li class="puzzle__tile-label puzzle__tile-label">${tile.index}</li>`;
    tileContent += `<li class="puzzle__tile-label puzzle__tile-label_right">${tile.right}</li>`;
    tileContent += `<li class="puzzle__tile-label puzzle__tile-label_bottom">${tile.bottom}</li>`;
    element.innerHTML = tileContent;
    return element;
}
tiles.map(tile => puzzleElement.append(tile.element));

document.querySelector('#puzzle').append(puzzle.element);

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
        moveAt(event.clientX, event.clientY);
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

        moveAt(clientX, clientY);
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
        dragElement.dispatchEvent(new Event('tile_finishdrag'));
    }

    function moveAt(clientX, clientY) {
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

        dragElement.style.left = newX + 'px';
        dragElement.style.top = newY + 'px';
        dragElement.dispatchEvent(new Event('tile_drag'));
    }

});