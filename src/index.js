'use strict';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

import './style.css';
import {drawCurve} from './canvas';
import Konva from 'konva';

const {Point, Vector, Tile, Group, Grid} = require('./primitives');

const SIDE_TYPES = {
    VALLEY: -1,
    FLAT: 0,
    MOUNTED: 1
};

const COLS = 3;
const ROWS = 3;
const TILE_SIZE = 100;
const TOLERANCE = 20;

const WIDTH = (TILE_SIZE + TOLERANCE * 2) * COLS;
const HEIGHT = (TILE_SIZE + TOLERANCE * 2) * ROWS;

// then create layer
const stage = new Konva.Stage({
    container: 'container', // id of container <div>
    width: WIDTH,
    height: HEIGHT
});
const layer = new Konva.Layer();
// add the layer to the stage
stage.add(layer);

const image = new Image();
image.src = 'https://img.fonwall.ru/o/vb/pole-derevo-vozdushnyy-shar-popugay.jpg?route=mid&amp;h=750';
image.onload = () => {
    layer.draw();
};

function getRandomSide() {
    const rand = Math.round(Math.random());
    return rand === 0 ? SIDE_TYPES.MOUNTED : SIDE_TYPES.VALLEY;
}

const puzzleElement = document.createElement('div');
puzzleElement.className = 'puzzle';

const grid = new Grid();

function getRandomArbitrary(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
        const index = (i * COLS) + j;
        // const position = new Point(getRandomArbitrary(0, Math.min(WIDTH - TILE_SIZE, TILE_SIZE * COLS)), getRandomArbitrary(0, Math.min(HEIGHT - TILE_SIZE, TILE_SIZE * ROWS)));
        const position = new Point(j * TILE_SIZE + j * 50, i * TILE_SIZE + i * 50);
        const top = hasTop(i) ? grid.tiles[getTopIndex(index, COLS)].bottom * -1 : SIDE_TYPES.FLAT;
        const right = hasRight(j, COLS) ? getRandomSide() : SIDE_TYPES.FLAT;
        const bottom = hasBottom(i, ROWS) ? getRandomSide() : SIDE_TYPES.FLAT;
        const left = hasLeft(j) ?  grid.tiles[index - 1].right * -1 : SIDE_TYPES.FLAT;
        const sides = [top, right, bottom, left];
        const tile = new Tile(position, index, TILE_SIZE, TILE_SIZE, sides);
        tile.i = i;
        tile.j = j;
        tile.element = drawTile(tile);
        tile.element.addEventListener('mouseover', () => {
            tile.parent.elements.forEach(({element}) => element.moveToTop());
            layer.draw();
        });
        tile.element.addEventListener('dragmove', (e) => {
            tile.parent.elements.forEach(({element}) => element.moveToTop());
            const moved = new Vector(tile.position, new Point(tile.element.x(), tile.element.y()));
            moveTileWithGroup(moved, tile.parent);
        });
        tile.element.addEventListener('dragend', (e) => {
            const moved = new Vector(tile.position, new Point(tile.element.x(), tile.element.y()));
            moveTileWithGroup(moved, tile.parent);
            const hasMatch = testMatching(tile);
            if (hasMatch) {
                tile.parent.elements.forEach(({element}) => element.moveToBottom());
            }
            layer.draw();
            testFinish(tile);
        });
        grid.tiles.push(tile);
        const group = new Group(tile);
        grid.add(group);
    }
}

grid.tiles = Object.freeze(grid.tiles);

function moveTileWithGroup(vector, group) {
    group.elements.forEach(item => item.move = vector);
    group.elements.forEach(redrawTile);
    layer.draw();
}

const has = tile => element => element.index === tile.index;
 
function testMatching(tile) {
    const checked = [];
    const checking = [...tile.parent.elements];
    let matched = false;
    while (checking.length > 0) {
        const current = checking.shift();
        checked.push(current);
        const index = current.index;
        const row = Math.floor(index / COLS);
        const col = index % COLS;
        if (hasTop(row)) {
            const adjacent = grid.tiles[getTopIndex(index, COLS)];
            if (!checked.some(has(adjacent)) && adjacent.parent !== current.parent) {
                const distance = new Vector(adjacent.bottomLeft, current.position);
                const length = distance.length();
                if (length <= TOLERANCE) {
                    moveTileWithGroup(distance, adjacent.parent);
                    checking.push(...adjacent.parent.elements);
                    current.parent.merge(adjacent.parent);
                    matched = true;
                }
            }
        }
        
        if (hasRight(col, COLS)) {
            const adjacent = grid.tiles[index + 1];
            if (!checked.some(has(adjacent)) && adjacent.parent !== current.parent) {
                const distance = new Vector(adjacent.position, current.topRight);
                const length = distance.length();
                if (length <= TOLERANCE) {
                    moveTileWithGroup(distance, adjacent.parent);
                    checking.push(...adjacent.parent.elements);
                    current.parent.merge(adjacent.parent);
                    matched = true;
                }
            }
        }

        if (hasLeft(col, COLS)) {
            const adjacent = grid.tiles[index - 1];
            if (!checked.some(has(adjacent)) && adjacent.parent !== current.parent) {
                const distance = new Vector(adjacent.topRight, current.position);
                const length = distance.length();
                if (length <= TOLERANCE) {
                    moveTileWithGroup(distance, adjacent.parent);
                    checking.push(...adjacent.parent.elements);
                    current.parent.merge(adjacent.parent);
                    matched = true;
                }
            }
        }
        
        if (hasBottom(row, ROWS)) {
            const adjacent = grid.tiles[getBottomIndex(index, COLS)];
            if (!checked.some(has(adjacent)) && adjacent.parent !== current.parent) {
                const distance = new Vector(adjacent.position, current.bottomLeft);
                const length = distance.length();
                if (length <= TOLERANCE) {
                    moveTileWithGroup(distance, adjacent.parent);
                    checking.push(...adjacent.parent.elements);
                    current.parent.merge(adjacent.parent);
                    matched = true;
                }
            }
        }

    }
    return matched;
}

function testFinish(tile) {
    if (tile.parent.elements.length === grid.tiles.length) {
        grid.tiles.forEach(tile => tile.element.draggable(false));
        setTimeout(() => alert('Congrats!'), 50);
    }
}

function redrawTile(tile) {
    tile.element.position(tile.position);
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
function getTopIndex(index, cols) {
    return index - cols;
}
function getBottomIndex(index, cols) {
    return index + cols;
}

function drawTile(tile) {
    const index = tile.index;
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    const linePoints = drawCurve(tile);
    const element = new Konva.Line({
        fillPatternImage: image,
        fillPatternOffsetX: col * tile.width + 700,
        fillPatternOffsetY: row * tile.height + 200,
        strokeEnabled: false,
        id: 'bezierLine',
        points: linePoints,
        bezier: true,
        closed: true,
        draggable: true,
        position: tile.position
    });
    layer.add(element);
    layer.draw();
    return element;
}

window.grid = grid;
window.layer = layer;
