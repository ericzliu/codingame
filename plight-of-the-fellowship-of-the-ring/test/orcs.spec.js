import { Orcs } from '../orcs';
import { assert } from 'chai';

describe('Orcs', function(){
    it('is node reachable should work', function() {
        const orcs_x = [0, 1, 2];
        const orcs_y = [0, 1, 2];
        const orcs = new Orcs(orcs_x, orcs_y);
        let isReachable = orcs.isNodeReachable(0, 1, 1);
        assert.equal(isReachable, false);
        
        isReachable = orcs.isNodeReachable(2, 0, 1);
        assert.equal(isReachable, true);
    });
});
