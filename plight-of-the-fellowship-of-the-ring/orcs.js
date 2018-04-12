import { Point, KdTree, axis_h, Champion } from "./kd-tree";
import { MINUS_INFINITY, PLUS_INFINITY } from "./utility";

export class Orcs {
    constructor(orcs_x, orcs_y) {
        const length = orcs_x.length;
        const points = new Array(length);
        for (let i = 0; i < length; i++) {
            points[i] = new Point(orcs_x[i], orcs_y[i]);
        }
        this.api = new KdTree();
        this.kdtree = this.api.insert(points, 0, length, axis_h, MINUS_INFINITY, MINUS_INFINITY, PLUS_INFINITY, PLUS_INFINITY);
    }

    isNodeReachable(x, y, dist) {
        const champion = new Champion();
        this.api.getNearestNeighbor(this.kdtree, x, y, champion);
        if (champion.distance <= dist) {
            return false;
        }
        return true;
    }
}
