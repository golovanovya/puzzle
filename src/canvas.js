import Konva from 'konva';

function drawCurve(mode) {
    const bezierPoints = [
        0, 0, 35, 15, 37, 5,
        37, 5, 40, 0, 38, -5,
        38, -5, 20, -20, 50, -20,
        50, -20, 80, -20, 62, -5,
        62, -5, 60, 0, 63, 5,
        63, 5, 65, 15, 100, 0,
        100, 0
    ];
    const shiftX = 0;
    const shiftY = 0;
    const tileWidth = 100;
    const tileHeight = 100;
    const lineTop = (point, index) => index % 2 === 0 ? point + shiftX : point * FLAT + shiftY;
    const lineRigth = bezierPoints.slice(0).reduce((r, e, i) => {
        if (i % 2 !== 0) {
            const prev = r.pop();
            r = [...r, e + shiftX + tileWidth, prev + shiftY];
        } else {
            r = [...r, e];
        }
        return r;
    }, []);
    const bottom = bezierPoints.slice(0)
        .reverse()
        .map((point, index) => index % 2 === 0 ? point * -mode + shiftX + tileHeight : point + shiftY)
        .reduce((r, e, i) => {
            if (i % 2 !== 0) {
                const prev = r.pop();
                r = [...r, e, prev];
            } else {
                r = [...r, e];
            }
            return r;
        }, []);

    return [...bezierPoints.slice(0).map(lineTop), ...lineRigth, ...bottom, ...bezierPoints.slice(0).map(lineTop).reverse()];

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
init();

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
