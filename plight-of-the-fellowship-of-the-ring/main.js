import { Graph, DijkstraExt } from './graph';
import { Orcs } from './orcs';
import { PLUS_INFINITY } from './utility';

export function findPath(spots_x, spots_y, orcs_x, orcs_y, portals_u, portals_v, S, E) {
    let graph = new Graph(spots_x.length);
    for (let i = 0; i < portals_u.length; i++) {
        graph.add(portals_u[i], portals_v[i]);
    }
    const orcs = new Orcs(orcs_x, orcs_y);
    const engine = new DijkstraExt(graph, spots_x, spots_y, S, E, orcs.isNodeReachable.bind(orcs));
    engine.apply();
    const dist = engine.getDistance(E);
    if (dist === PLUS_INFINITY) {
        return undefined;
    }
    return engine.getPath();
}
