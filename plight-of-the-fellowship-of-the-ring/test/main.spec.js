import { findPath } from '../main';
import { assert } from 'chai';

describe('main', function() {
    it('exemple should work', function() {
        const spot_x = [1, 2, 2, 3];
        const spot_y = [1, 0, 2, 1];
        const orcs_x = [1];
        const orcs_y = [2];
        const portals_u = [0, 0, 1, 2];
        const portals_v = [1, 2, 3, 3];
        let path = findPath(spot_x, spot_y, orcs_x, orcs_y, portals_u, portals_v, 0, 3);
        assert.deepEqual(path, [0, 1, 3]);
    });
});