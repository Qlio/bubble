// TODO refactor.
const $canvas = document.getElementById('canva');
const $canvas1 = document.getElementById('canva1');
$canvas1.style.display = 'none';

$canvas.width = 500;
$canvas.height = 500;

$canvas1.width = 500;
$canvas1.height = 500;

const ctx = $canvas.getContext('2d');
const ctx1 = $canvas1.getContext('2d');

const $img = document.getElementById('img');
$img.style.display = 'none';

const BGCOLOR = '#fff';

const getMediumOfRect = (ctx, x, y, radius) => {
    const imgData = ctx.getImageData(x, y, radius, radius);
    let [ r, g, b ] = [ 0, 0, 0 ];
    let count = 0;
    for (let i = 0; i < imgData.data.length; i += 4) {
        count ++;
        r += imgData.data[i];
        g += imgData.data[i + 1];
        b += imgData.data[i + 2];
    }
    const medR = r / count;
    const medG = g / count;
    const medB = b / count;
    return `rgb(${medR}, ${medG}, ${medB})`
}

class Circle {
    constructor(ctx, x, y, r, c) {
        this.ctx = ctx;

        this.x = x;
        this.y = y;
        this.r = r;
        this.c = c;

        this.children = [];
        this.circle = new Path2D();
    }

    draw() {
        if (this.children.length) {
            for (const child of this.children) {
                child.draw();
            }
        } else {
            this.circle.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
            this.ctx.fillStyle = this.c;
            this.ctx.fill(this.circle);
        }
    }

    clear() {
        this.circle.rect(this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
        this.ctx.fillStyle = this.c;

        this.ctx.fillStyle = BGCOLOR;
        this.ctx.fill(this.circle);
    }

    divide() {
        const childRadius = this.r / 2;
        if (childRadius < 1) return;
        this.children.push(
            new Circle(
                this.ctx,
                this.x - childRadius,
                this.y - childRadius,
                childRadius,
                getMediumOfRect(ctx1, this.x - childRadius * 2, this.y - childRadius * 2, childRadius * 2),
            ),
            new Circle(
                this.ctx,
                this.x + childRadius,
                this.y - childRadius,
                childRadius,
                getMediumOfRect(ctx1, this.x, this.y - childRadius * 2, childRadius * 2),
            ),
            new Circle(
                this.ctx,
                this.x + childRadius,
                this.y + childRadius,
                childRadius,
                getMediumOfRect(ctx1, this.x, this.y, childRadius * 2),
            ),
            new Circle(
                this.ctx,
                this.x - childRadius,
                this.y + childRadius,
                childRadius,
                getMediumOfRect(ctx1, this.x - childRadius * 2, this.y, childRadius * 2),
            ),
        )
    }
}

const findClicked = (node, x, y) => {
    if (!node.ctx.isPointInPath(node.circle, x, y)) {
        return;
    }
    if (!node.children.length) {
        if (node.ctx.isPointInPath(node.circle, x, y)) {
            return node;
        }
    } else {
        for (const child of node.children) {
            const rval = findClicked(child, x, y);
            if (rval) {
                return rval;
            }
        }
    }
}

document.querySelector('img').onload = () => {
    ctx1.drawImage($img, 0, 0, $img.width, $img.height, 0, 0, $canvas1.width, $canvas1.height);

    const color = getMediumOfRect(ctx1, 0, 0, 500);

    const c = new Circle(ctx, 250, 250, 250, color);
    c.draw();

    $canvas.onclick = (e) => {
        const clickedCircle = findClicked(c, e.offsetX, e.offsetY);
        if (!clickedCircle) return;

        clickedCircle.clear();
        clickedCircle.divide();
        c.draw();
    }
}
