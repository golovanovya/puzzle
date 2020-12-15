const bezierPoints = [
    0,  0,      35, 15,     37, 5,
    37, 5,      40, 0,      38, -5,
    38, -5,     20, -20,    50, -20,
    50, -20,    80, -20,    62, -5,
    62, -5,     60, 0,      63, 5,
    63, 5,      65, 15,     100, 0,
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

export {drawCurve};
