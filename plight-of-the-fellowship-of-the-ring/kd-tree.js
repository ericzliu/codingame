import { isUndefinedOrNull } from './utility';

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
    constructor(x, y, split_axis) {
        this.x = x;
        this.y = y;
        this.split_axis = split_axis;
        this.left = undefined;
        this.right = undefined;
    }
}

export function swap(array, i, j) {
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
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
    insert(points, start, end, split_axis) {
        if (isUndefinedOrNull(points) || points.length === 0) {
            return undefined;
        } else if (points.length === 1) {
            const p = points[0];
            return new Node(p.x, p.y, split_axis);
        } else {
            const p = this.select(points, start, end, split_axis);
            const m = this.split(points, start, end, p, split_axis);
            const node = new Node(p.x, p.y, split_axis);
            const new_axis = split_axis === axis_h ? axis_v : axis_h;
            node.left = this.insert(points, 0, m, new_axis);
            node.right = this.insert(points, m + 1, end, new_axis);
            return node;
        }
    }
}