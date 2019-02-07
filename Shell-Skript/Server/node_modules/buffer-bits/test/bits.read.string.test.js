var Bits = require('../lib/index');
var expect = require('chai').expect

describe('Bits read string', function() {
    it('should be able to read string from current Bits', function() {        
        var buffer = Buffer.from('gg');
        var bits = Bits.from(buffer, 3, 13);
        expect(bits.readString()).equals(';8');

        bits = Bits.from(buffer, 3, 5);
        expect(bits.readString()).equals('8');
    });
});