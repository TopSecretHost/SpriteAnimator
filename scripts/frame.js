class Frame {
    constructor(x, y, width, height, index) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.index = index;
    }

    contains(pointX, pointY) {
        return pointX >= this.x && pointX <= this.x + this.width &&
               pointY >= this.y && pointY <= this.y + this.height;
    }

    draw(ctx, color) {
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = 'red';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(this.index + 1, this.x + 5, this.y + 25);
    }

    resize(direction, dx, dy) {
        if (direction === 'right') {
            this.width += dx;
        } else if (direction === 'bottom') {
            this.height += dy;
        } else if (direction === 'left') {
            this.x += dx;
            this.width -= dx;
        } else if (direction === 'top') {
            this.y += dy;
            this.height -= dy;
        } else if (direction === 'top-left') {
            this.x += dx;
            this.width -= dx;
            this.y += dy;
            this.height -= dy;
        } else if (direction === 'top-right') {
            this.width += dx;
            this.y += dy;
            this.height -= dy;
        } else if (direction === 'bottom-left') {
            this.x += dx;
            this.width -= dx;
            this.height += dy;
        } else if (direction === 'bottom-right') {
            this.width += dx;
            this.height += dy;
        }
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}
