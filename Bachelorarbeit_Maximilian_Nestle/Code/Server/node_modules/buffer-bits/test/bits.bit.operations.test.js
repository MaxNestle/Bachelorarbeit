var Bits = require('../lib/index');
var expect = require('chai').expect

describe('Bits read/set bit (using \'bit-encode\' by mafintosh: https://github.com/mafintosh/bit-encode)', function() {
    it('should be able to read a bit', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 1, 7);
        expect(bits.readBit(0)).is.true;
        expect(bits.readBit(1)).is.true;
        expect(bits.readBit(2)).is.false;
        expect(bits.readBit(3)).is.false;
        expect(bits.readBit(4)).is.false;
        expect(bits.readBit(5)).is.true;
        expect(bits.readBit(6)).is.true;
    });

    it('should be able to set a bit', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 1, 7);
        expect(bits.readBit(4)).is.false;
        bits.setBit(4, true);
        expect(bits.readBit(4)).is.true;

        expect(bits.readBit(3)).is.false;
        bits.setBit(3, 1);
        expect(bits.readBit(3)).is.true;

        expect(bits.readBit(6)).is.true;
        bits.setBit(6, false);
        expect(bits.readBit(6)).is.false;

        expect(bits.readBit(5)).is.true;
        bits.setBit(5, 0);
        expect(bits.readBit(5)).is.false;
    });
});

describe('Bits other bit operations', function() {

    it('should be able to toogle a bit', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 1, 7);
        expect(bits.readBit(4)).is.false;
        bits.setBit(4, true);
        expect(bits.readBit(4)).is.true;

        bits.toggleBit(4);
        expect(bits.readBit(4)).is.false;

        bits.toggleBit(4);
        expect(bits.readBit(4)).is.true;


        expect(bits.readBit(0)).is.true;
        expect(bits.readBit(1)).is.true;
        expect(bits.readBit(2)).is.false;
        expect(bits.readBit(3)).is.false;
        expect(bits.readBit(5)).is.true;
        expect(bits.readBit(6)).is.true;
    });

    it('should be able to toogle all bits', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 1, 7);
        expect(bits.readBit(4)).is.false;
        expect(bits.readBit(0)).is.true;
        expect(bits.readBit(1)).is.true;
        expect(bits.readBit(2)).is.false;
        expect(bits.readBit(3)).is.false;
        expect(bits.readBit(5)).is.true;
        expect(bits.readBit(6)).is.true;

        bits.toggleAll();
        expect(bits.readBit(4)).is.true;
        expect(bits.readBit(0)).is.false;
        expect(bits.readBit(1)).is.false;
        expect(bits.readBit(2)).is.true;
        expect(bits.readBit(3)).is.true;
        expect(bits.readBit(5)).is.false;
        expect(bits.readBit(6)).is.false;
    });
});