import Konva from 'konva';

const MOUNTED = 1;
const FLAT = 0;
const VALLEY = -1;

const bezierPoints = [
    0, 0, 35, 15, 37, 5,
    37, 5, 40, 0, 38, -5,
    38, -5, 20, -20, 50, -20,
    50, -20, 80, -20, 62, -5,
    62, -5, 60, 0, 63, 5,
    63, 5, 65, 15, 100, 0,
    100, 0
];

function drawCurve(tile) {
    const tileWidth = tile.width;
    const tileHeight = tile.height;
    const top = bezierPoints
        .map((point, index) => index & 1 ? point * tile.top : point); // curve
    const right = bezierPoints
        .map((point, index) => index & 1 ? point * -tile.right : point) // curve
        .map((point, index) => index & 1 ? point + tileWidth : point) // shift
        .map((e, i, a) => i & 1 ? a[i - 1] : a[i + 1]); // rotate
    const bottom = bezierPoints
        .map((point, index) => index & 1 ? point * -tile.bottom : point) // curve
        .map((point, index) => index & 1 ? point + tileHeight : point) // shift
        .reverse().map((e, i, a) => i & 1 ? a[i - 1] : a[i + 1]); //rotate
    const left = bezierPoints
        .map((point, index) => index & 1 ? point * tile.left : point) // curve
        .reverse(); // rotate
    return [...top, ...right, ...bottom, ...left];

}

function init() {
    var stage = new Konva.Stage({
        container: 'container', // id of container <div>
        width: 1000,
        height: 1000
    });

    const linePoints = drawCurve(MOUNTED);

    // then create layer
    var layer = new Konva.Layer();

    const image = new Image();
    image.onload = function () {
        console.log(image.width);
        console.log(image.height);
        const tile = new Konva.Line({
            strokeWidth: 0,
            stroke: 'black',
            fillPatternImage: image,
            strokeEnabled: false,
            id: 'bezierLine',
            points: linePoints,
            bezier: true,
            closed: true,
            draggable: true
        });
        // layer.add(image);
        layer.add(tile);
        // stage.add(layer);
        layer.draw();
    };
    image.src = 'https://img.fonwall.ru/o/vb/pole-derevo-vozdushnyy-shar-popugay.jpg?route=mid&amp;h=750';

    // add the layer to the stage
    stage.add(layer);

    // draw the image
    layer.draw();
}
// init();

function generateTiles(width, height, tileWidth, tileHeight) {
    const lengthX = Math.floor(width / tileWidth);
    const lenghtY = Math.floor(height / tileHeight);
    let matrix = [];

    for (let i = 0; i < lengthX; i++) {
        matrix[i] = [];
        for (let j = 0; j < lenghtY; j++) {
            let right, bottom, left, top;
            if (i === 0) {
                left = FLAT;
                right = Math.round(Math.random()) === 1 ? MOUNTED : VALLEY;
            } else if (i === lengthX - 1) {
                right = FLAT;
                left = matrix[i - 1][j] * -1;
            } else {
                right = Math.round(Math.random()) === 1 ? 1 : -1;
                left = matrix[i - 1][j] * -1;
            }

            if (j === 0) {
                top = FLAT;
                bottom = Math.round(Math.random()) === 1 ? MOUNTED : VALLEY;
            } else if (j === lengthY - 1) {
                bottom = FLAT;
                top = Math.round(Math.random()) === 1 ? MOUNTED : VALLEY;
            } else {
                bottom = Math.round(Math.random()) === 1 ? MOUNTED : VALLEY;
                top = Math.round(Math.random()) === 1 ? MOUNTED : VALLEY;
            }
            matrix[i][j] = [right, bottom, left, top];
        }
    }
}

export {drawCurve};
