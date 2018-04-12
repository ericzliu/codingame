export function isUndefinedOrNull(x) {
    return (x === undefined || x === null);
}

export function remove(array, element) {
    const i = array.indexOf(element);
    if (i > -1) {
        array.splice(i, 1);
    }
}

export function getEuclideanDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

export function getDistanceLowerBound(min_x, min_y, max_x, max_y, x, y) {
    let dx = 0;
    let dy = 0;
    if (x < min_x) {
        dx = min_x - x;
    } else if (x > max_x) {
        dx = x - max_x;
    }
    if (y < min_y) {
        dy = min_y - y;
    } else if (y > max_y) {
        dy = y - max_y;
    }
    if (dx !== 0 && dy !== 0) {
        return Math.sqrt(dx * dx + dy * dy);
    } else if (dy === 0 && dx !== 0) {
        return dx;
    } else if (dx === 0 && dy !== 0) {
        return dy;
    }
    return 0;
}
