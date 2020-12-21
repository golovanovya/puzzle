import './style.css';
import Konva from 'konva';
const {Grid} = require('./grid');

const COLS = 3;
const ROWS = 3;
const TILE_SIZE = 100;
const TOLERANCE = 20;
const DISPLAY_S = 320;

const WIDTH = (TILE_SIZE + TOLERANCE * 2) * COLS;
const HEIGHT = (TILE_SIZE + TOLERANCE * 2) * ROWS;

// then create layer
const stage = new Konva.Stage({
    container: 'canvas', // id of container <div>
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
    random: process.env.NODE_ENV === 'production'
});

function fitStageIntoParentContainer() {
    const containerWidth = document.querySelector('.container').offsetWidth;

    // now we need to fit stage into parent
    let canvasWidth = containerWidth;
    if (containerWidth < DISPLAY_S) {
        canvasWidth = DISPLAY_S;
    }
    if (containerWidth > WIDTH) {
        canvasWidth = WIDTH;
    }
    // to do this we need to scale the stage
    const scale = canvasWidth < WIDTH ? canvasWidth / WIDTH : 1;

    stage.width(WIDTH * scale);
    stage.height(HEIGHT * scale);
    stage.scale({ x: scale, y: scale });
    stage.draw();
}
fitStageIntoParentContainer();
window.addEventListener('resize', fitStageIntoParentContainer);
