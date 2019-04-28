var Bits = require('../lib/index');
var expect = require('chai').expect;
var BitEncode = require('bit-encode');

describe('Bits equals', function() {
    it('should be able to check if this bit equals to another one', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 1, 7);

        var buffer2 = Buffer.from([99 << 1]);
        var bits2 = Bits.from(buffer2, 0, 7);

        expect(bits.equals(bits2)).to.be.true;

        BitEncode.set(bits2.buffer, 0, true);
        expect(bits.buffer[0]).not.equals(bits2.buffer[0]);
        expect(bits.equals(bits2)).to.be.true;
    });

    it('should be able to check if this bit does not equal to another one', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 1, 7);

        var buffer2 = Buffer.from([99 << 1]);
        var bits2 = Bits.from(buffer2, 0, 6);

        expect(bits.equals(bits2)).to.be.false;
    });

    it('should be able to check if this bit does not equal to another non-Bits object', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 1, 7);

        expect(bits.equals({})).to.be.false;
    });

    it('DEFECT #1: should be able to check if this bit equals another Bits object when byteLength larger than 1', function() {
        var buffer = Buffer.from([99, 98]);
        var bits = Bits.from(buffer, 1, 15);
        var bits2 = Bits.from(buffer, 1, 15);

        expect(bits.equals(bits2)).to.be.true;
    });
});