'use strict';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

import './style.css';
import Konva from 'konva';
const {Grid} = require('./grid');

const COLS = 3;
const ROWS = 3;
const TILE_SIZE = 100;
const TOLERANCE = 20;
const RANDOM = false;

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

const grid = new Grid({
    image,
    width: WIDTH,
    height: HEIGHT,
    layer,
    random: RANDOM
});

window.grid = grid;
