import { isUndefinedOrNull } from './utility';
import { debug } from 'util';

export const axis_h = Symbol('h');
export const axis_v = Symbol('v');

export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get(axis) {
        if (axis === axis_h) {
            return this.x;
        } else {
            return this.y;
        }
    }
}

export class Node {
    constructor(x, y, split_axis, min_x, min_y, max_x, max_y) {
        this.x = x;
        this.y = y;
        this.split_axis = split_axis;
        this.min_x = min_x;
        this.min_y = min_y;
        this.max_x = max_x;
        this.max_y = max_y;
        this.left = undefined;
        this.right = undefined;
    }
}

export function swap(array, i, j) {
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
}

export class Champion {
    constructor(x, y, distance) {
        this.x = x;
        this.y = y;
        this.distance = distance;
        if (isUndefinedOrNull(this.distance)) {
            this.distance = Number.POSITIVE_INFINITY;
        }
    }
}

export class KdTree {

    constructor() {
    }

    select(points, start, end, split_axis) {
        const length = end - start;
        if (length < 3) {
            return points[0];
        } else {
            const quotient = Math.floor(length / 2);
            const pivots = [];
            pivots.push(points[start + quotient]);
            pivots.push(points[start]);
            pivots.push(points[end - 1]);
            const comp = function (p1, p2) {
                if (split_axis === axis_h) {
                    return p1.x - p2.x;
                } else {
                    return p1.y - p2.y;
                }
            };
            pivots.sort(comp);
            return pivots[1];
        }
    }

    /**
     * Split the points array by point
     * @param { Point[] } points 
     * @param { Point } point 
     * @param { axis_h or axis_v } split_axis 
     */
    split(points, start, end, point, split_axis) {
        let i = start - 1;
        let k = points.indexOf(point, start);
        swap(points, k, end - 1);
        for (let j = start; j < end - 1; j++) {
            if (points[j].get(split_axis) < point.get(split_axis)) {
                i = i + 1;
                swap(points, i, j);
            }
        }
        swap(points, i + 1, end - 1);
        return i + 1;
    }

    /**
     * insert points to a KdTree
     * @param {Point[]} points 
     */
    insert(points, start, end, split_axis, min_x, min_y, max_x, max_y) {
        const length = end - start;
        if (isUndefinedOrNull(points) || length === 0) {
            return undefined;
        } else if (length === 1) {
            const p = points[start];
            return new Node(p.x, p.y, split_axis, min_x, min_y, max_x, max_y);
        } else {
            debugger;
            const p = this.select(points, start, end, split_axis);
            const m = this.split(points, start, end, p, split_axis);
            const node = new Node(p.x, p.y, split_axis, min_x, min_y, max_x, max_y);
            const new_axis = split_axis === axis_h ? axis_v : axis_h;
            let min_x1 = min_x;
            let min_y1 = min_y;
            let max_x1 = max_x;
            let max_y1 = max_y;
            let min_x2 = min_x;
            let min_y2 = min_y;
            let max_x2 = max_x;
            let max_y2 = max_y;
            if (split_axis === axis_h) {
                max_x1 = p.x;
                min_x2 = p.x;
            } else {
                max_y1 = p.y;
                min_y2 = p.y;
            }
            node.left = this.insert(points, start, m, new_axis, min_x1, min_y1, max_x1, max_y1);
            node.right = this.insert(points, m + 1, end, new_axis, min_x2, min_y2, max_x2, max_y2);
            return node;
        }
    }

    getNearestNeighbor(node, x, y, champion) {

    }
}
