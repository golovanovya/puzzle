const config = require('./config');

import './style.css';
import Konva from 'konva';
const {Grid} = require('./grid');

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
image.src = config.defaultImage;
image.onload = () => {
    layer.draw();
};

const grid = new Grid({
    image,
    width: WIDTH,
    height: HEIGHT,
    layer,
    random: config.mode !== 'development'
});

window.grid = grid;
