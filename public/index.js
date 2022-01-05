const $canvas = document.getElementById('playground');
const $imageContainer = document.getElementById('image-container');
const $img = document.getElementById('img');
let isOriginalImageVisible = false;
document.querySelector('button').onclick = () => {
    isOriginalImageVisible = !isOriginalImageVisible;
    console.log(isOriginalImageVisible)
    $img.style.display = isOriginalImageVisible ? 'block' : 'none';
};

const SIZE = 500;
const BGCOLOR = '#fff';

$canvas.width = SIZE;
$canvas.height = SIZE;

$imageContainer.width = SIZE;
$imageContainer.height = SIZE;

const ctx = $canvas.getContext('2d');
const imgCtx = $imageContainer.getContext('2d');

const getMedianColorOfSquare = (x, y, size) => {
    const imgData = imgCtx.getImageData(x, y, size, size);
    let [r, g, b] = [0, 0, 0];
    for (let i = 0; i < imgData.data.length; i += 4) {
        r += imgData.data[i];
        g += imgData.data[i + 1];
        b += imgData.data[i + 2];
    }

    const count = imgData.data.length / 4;
    const medR = r / count;
    const medG = g / count;
    const medB = b / count;
    return `rgb(${medR}, ${medG}, ${medB})`
}

class Circle {
    constructor(ctx, x, y, radius, color) {
        this.ctx = ctx;

        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;

        this.children = [];
        this.path2D = new Path2D();
    }

    draw() {
        if (this.children.length) {
            for (const child of this.children) {
                child.draw();
            }
        } else {
            if (parseInt(this.radius) < 1) {
                this.path2D.rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            } else {
                this.path2D.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            }
            this.ctx.fillStyle = this.color;
            this.ctx.fill(this.path2D);
        }
    }

    clear() {
        this.path2D.rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        this.ctx.fillStyle = BGCOLOR;
        this.ctx.fill(this.path2D);
    }

    divide() {
        const childRadius = this.radius / 2;
        if (childRadius < 1) return;

        const centers = [
            [ this.x - childRadius, this.y - childRadius ],
            [ this.x + childRadius, this.y - childRadius ],
            [ this.x - childRadius, this.y + childRadius ],
            [ this.x + childRadius, this.y + childRadius ],
        ];

        for (const [x, y] of centers) {
            const color = getMedianColorOfSquare(x - childRadius, y - childRadius, childRadius * 2);
            const childCircle = new Circle(this.ctx, x, y, childRadius, color);

            this.children.push(childCircle);
        }
    }

    isClicked(x, y) {
        return this.ctx.isPointInPath(this.path2D, x, y);
    }
}

const findClicked = (rootCircle, x, y) => {
    let node = rootCircle;
    if (!node.isClicked(x, y)) return;

    do {
        if (!node.children.length) {
            return node;
        }

        let clickedChild;
        for (const child of node.children) {
            if (child.isClicked(x, y)) {
                clickedChild = child;
                break;
            }
        }

        node = clickedChild
    } while (node);

    return node;
}

document.querySelector('img').onload = () => {
    imgCtx.drawImage($img, 0, 0, $img.width, $img.height, 0, 0, $imageContainer.width, $imageContainer.height);

    const color = getMedianColorOfSquare(0, 0, SIZE);
    const rootCircle = new Circle(ctx, SIZE / 2, SIZE / 2, SIZE / 2, color);
    rootCircle.draw();

    $canvas.onmousemove = (e) => {
        const clickedCircle = findClicked(rootCircle, e.offsetX, e.offsetY);
        if (!clickedCircle) return;

        clickedCircle.clear();
        clickedCircle.divide();
        clickedCircle.draw();
    }
}
