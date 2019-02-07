var Bits = require('../lib/index');
var expect = require('chai').expect

describe('Bits read int', function() {
    it('should be able to read 8 bit int', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 3, 3);
        expect(bits.readInt()).equals(0);
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 1, 3);
        expect(bits.readInt()).equals(6);
    });

    it('should be able to read 16 bit int', function() {
        var buffer = Buffer.from([99, 98]);
        var bits = Bits.from(buffer, 3, 9);
        expect(bits.readInt()).equals(54);
    });

    it('should be able to read 32 bit int', function() {
        var buffer = Buffer.from([99, 98, 97]);
        var bits = Bits.from(buffer, 1, 22);
        expect(bits.readInt()).equals(3256624);
    });

    it('DEFECT: should be able to read int when there could be useless bits before startOffset', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 3, 5);
        expect(bits.readInt()).equals(3);
    });

    it('should be able to read int with little endian', function() {
        var buffer = Buffer.from([0, 5]);
        var bits = Bits.from(buffer, 0, 16);
        expect(bits.readInt()).equals(5);
        expect(bits.readIntLE()).equals(1280);
    });

    it('should be able to read unsigned int', function() {
        var buffer = Buffer.from([254, 98, 97]);
        var bits = Bits.from(buffer, 0, 8);
        expect(bits.readUInt()).equals(254);
        expect(bits.readInt()).equals(-2);
    });

    it('should be able to read unsigned int with little endian', function() {
        var buffer = Buffer.from([0x12, 0x34]);
        var bits = Bits.from(buffer, 0, 16);
        expect(bits.readUInt()).equals(0x1234);
        expect(bits.readUIntLE()).equals(0x3412);
    });
});