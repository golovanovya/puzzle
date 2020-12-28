const {Element, Tile, SIDE_TYPES, Point, Vector} = require('./primitives');
const Group = require('./group');
const {drawCurve} = require('./canvas');
const utils = require('./utils');
const Konva = require('konva');

const DEFAULTS = {
    cols: 3,
    rows: 3,
    tileWidth: 100,
    tileHeight: 100,
    tolerance: 20,
    randPosition: true,
    image: null,
    width: null,
    height: null,
    layer: null,
    random: true
};

class Grid extends Element {
    constructor(params) {
        super();
        
        this.params = Object.assign({}, DEFAULTS, params);
        this.assembled = false;
        if (this.params.image === null) {
            throw new Error("image param is required");
        }
        if (this.params.width === null) {
            throw new Error("width param is required");
        }
        if (this.params.height === null) {
            throw new Error("height param is required");
        }
        if (this.params.layer === null) {
            throw new Error("layer param is required");
        }
        this._generateTiles();
    }

    _getRandomSide() {
        const rand = Math.round(Math.random());
        return rand === 0 ? SIDE_TYPES.MOUNTED : SIDE_TYPES.VALLEY;
    }

    _generateSides(row, col) {
        const {cols, rows} = this.params;
        const top       = row     === 0        ? SIDE_TYPES.FLAT : this._tiles[row - 1][col].bottom * -1;
        const right     = col + 1 === cols     ? SIDE_TYPES.FLAT : this._getRandomSide();
        const bottom    = row + 1 === rows     ? SIDE_TYPES.FLAT : this._getRandomSide();
        const left      = col     === 0        ? SIDE_TYPES.FLAT : this._tiles[row][col - 1].right * -1;
        return [top, right, bottom, left];
    }

    _generatePosition(row, col) {
        const {tileWidth, tileHeight, width, height, tolerance, random} = this.params;
        const x = random ? utils.rand(0, width - tileWidth) : col * tileWidth + col * tolerance * 2;
        const y = random ? utils.rand(0, height - tileHeight) : row * tileHeight + row * tolerance * 2;
        return new Point(x, y);
    }

    _generateTiles() {
        this._tiles = [];
        const {rows, cols, layer, tileWidth, tileHeight, random} = this.params;
        for (let i = 0; i < rows; i++) {
            this._tiles[i] = [];
            for (let j = 0; j < cols; j++) {
                const index = i * cols + j;
                const position = this._generatePosition(i, j);
                const tile = new Tile(position, index, tileWidth, tileHeight, this._generateSides(i, j));
                tile.element = this._buildTileShape(tile);
                this._setEvents(tile);
                layer.add(tile.element);
                this._tiles[i][j] = tile;
                const group = new Group(tile);
                this.add(group);
            }
        }
    }

    _setEvents(tile) {
        const {layer} = this.params;
        tile.element.addEventListener('click', () => {
            tile.parent.elements.forEach(({element}) => element.moveToTop());
            layer.draw();
        });
        tile.element.addEventListener('dragstart', (e) => {
            tile.parent.elements.forEach(({element}) => element.moveToTop());
        });
        tile.element.addEventListener('dragmove', (e) => {
            const moved = new Vector(tile.position, new Point(tile.element.x(), tile.element.y()));
            this._moveTileWithGroup(moved, tile.parent);
        });
        tile.element.addEventListener('dragend', (e) => {
            const moved = new Vector(tile.position, new Point(tile.element.x(), tile.element.y()));
            this._moveTileWithGroup(moved, tile.parent);
            this._testMatching(tile);
            tile.parent.elements.forEach(({element}) => element.moveToTop());
            layer.draw();
            this._testFinish();
        });
    }

    _moveTileWithGroup(vector, group) {
        group.elements.forEach(item => item.move = vector);
        group.elements.forEach(tile => tile.element.position(tile.position));
    }

    _testMatching(tile) {
        const checked = [];
        const checking = [...tile.parent.elements];
        let matched = false;
        const {tolerance} = this.params;
        const pointMap = ["bottomLeft", "topLeft", "topRight", "bottomRight"];
        const has = tile => element => element.index === tile.index;
        while (checking.length > 0) {
            const current = checking.shift();
            checked.push(current);
            const nearest = this.getNear(current);
            nearest.forEach((adjacent, index) => {
                if (adjacent === undefined || adjacent.parent === current.parent || checked.some(has(adjacent))) {
                    return;
                }
                const distance = new Vector(adjacent[pointMap[index]], current.points[index])
                if (distance.length() <= tolerance) {
                    this._moveTileWithGroup(distance, adjacent.parent);
                    checking.push(...adjacent.parent.elements);
                    const empty = adjacent.parent;
                    current.parent.merge(adjacent.parent);
                    this.remove(empty);
                    matched = true;
                }
            });
        }
        return matched;
    }

    _testFinish() {
        if (this.elements.length === 1 && !this.assembled) {
            this.assembled = !this.assembled;
            setTimeout(() => alert('congrats!'), 50);
        }
    }

    // todo: remove image offset
    _buildTileShape(tile) {
        const linePoints = drawCurve(tile);
        const {col, row} = this._indexToGrid(tile.index);
        const {layer} = this.params;
        const shape = new Konva.Line({
            position: tile.position,
            strokeWidth: 0,
            strokeEnabled: false,
            fillPatternImage: this.params.image,
            fillPatternOffsetX: col * tile.width + 500,
            fillPatternOffsetY: row * tile.height,
            id: `tile${tile.index}`,
            points: linePoints,
            bezier: true,
            closed: true,
            draggable: true,
        });
        return shape;
    }

    _indexToGrid(index) {
        const {cols} = this.params;
        return {row: Math.floor(index / cols), col: index % cols};
    }

    /**
     * 
     * @param Tile tile
     * @returns array top, right, bottom, left
     */
    getNear(tile) {
        const tiles = this._tiles;
        const {col, row} = this._indexToGrid(tile.index);
        return [
            tiles[row - 1] ?    tiles[row - 1][col]     : undefined,
                                tiles[row]    [col + 1],
            tiles[row + 1] ?    tiles[row + 1][col]     : undefined,
                                tiles[row]    [col - 1],
        ];
    }
}

module.exports = Grid;
