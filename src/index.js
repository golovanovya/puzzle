import './style.css';
import Konva from 'konva';
const Grid = require('./grid');

const COLS = 3;
const ROWS = 3;
const TILE_SIZE = 100;
const TOLERANCE = 20;
const DISPLAY_S = 320;
const CANVAS_HEIGHT = 734;

const WIDTH = (TILE_SIZE + TOLERANCE * 2) * COLS;
const HEIGHT = (TILE_SIZE + TOLERANCE * 2) * ROWS;

function calcCanvasWidth() {
    const containerWidth = document.querySelector('#canvas').offsetWidth;
    // now we need to fit stage into parent
    return containerWidth < DISPLAY_S ? DISPLAY_S : containerWidth;
}

function getScaleX() {
    const canvasWidth = calcCanvasWidth();
    return canvasWidth < WIDTH ? canvasWidth / WIDTH : 1;
    
}

function getScaleY() {
    return CANVAS_HEIGHT < HEIGHT ? CANVAS_HEIGHT / HEIGHT : 1;
}

function getScale() {
    // to do this we need to scale the stage
    return Math.min(getScaleX(), getScaleY());
}

// then create layer
const stage = new Konva.Stage({
    container: 'canvas', // id of container <div>
    width: WIDTH,
    height: CANVAS_HEIGHT
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
    width: calcCanvasWidth() * (getScale() ** -1),
    height: CANVAS_HEIGHT * (getScale() ** -1),
    layer,
    random: true || process.env.NODE_ENV === 'production',
    cols: COLS,
    rows: ROWS,
});

function fitStageIntoParentContainer() {
    const canvasWidth = calcCanvasWidth();
    const scale = getScale();
    stage.width(canvasWidth);
    stage.height(CANVAS_HEIGHT);
    stage.scale({ x: scale, y: scale });
    stage.draw();
}
fitStageIntoParentContainer();
window.addEventListener('resize', fitStageIntoParentContainer);
