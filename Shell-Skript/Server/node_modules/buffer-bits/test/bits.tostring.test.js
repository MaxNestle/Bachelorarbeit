var Bits = require('../lib/index');
var expect = require('chai').expect

describe('Bits to string', function() {
    it('should be able to handle the default toString method', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 3, 3);
        expect(bits.buffer[0]).equals(0);
        expect(bits.length).equals(3);
        expect(bits.startOffset).equals(5);
        expect(bits.toString()).equals('[Bits Object]');
    });

    it('should be able to convert itself to binary string', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 3, 3);
        expect(bits.buffer[0]).equals(0);
        expect(bits.length).equals(3);
        expect(bits.startOffset).equals(5);
        expect(bits.toBinaryString()).equals('0b000')
    });
});