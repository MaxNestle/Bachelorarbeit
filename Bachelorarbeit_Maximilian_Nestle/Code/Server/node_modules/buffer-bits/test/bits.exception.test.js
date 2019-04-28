var Bits = require('../lib/index');
var expect = require('chai').expect

describe('Bits exceptions', function() {
    it('should throw if the buffer type is not right', function() {
        var func = Bits.from.bind(null, [], 0, 8);
        expect(func).to.throw(Error);
    });

    it('should throw if the requested length is larger than the buffer size', function() {
        var buffer = Buffer.from([99]);
        var func = Bits.from.bind(Bits, buffer, 0, 9);
        expect(func).to.throw(Error);
    });

    it('should throw if the requested length plus offset is larger than the buffer size', function() {
        var buffer = Buffer.from([99]);
        var func = Bits.from.bind(Bits, buffer, 1, 8);
        expect(func).to.throw(Error);
    });

    it('should throw when read the bit out of range - larger than length', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 3, 3);
        expect(bits.buffer[0]).equals(0);
        expect(bits.length).equals(3);
        expect(bits.startOffset).equals(5);
        var func = bits.readBit.bind(bits, 4);
        expect(func).to.throw(Error);
    });

    it('should throw when read the bit out of range - equals length', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 3, 3);
        expect(bits.buffer[0]).equals(0);
        expect(bits.length).equals(3);
        expect(bits.startOffset).equals(5);
        var func = bits.readBit.bind(bits, 3);
        expect(func).to.throw(Error);
    });

    it('should throw when read the bit out of range - less than zero', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 3, 3);
        expect(bits.buffer[0]).equals(0);
        expect(bits.length).equals(3);
        expect(bits.startOffset).equals(5);
        var func = bits.readBit.bind(bits, -1);
        expect(func).to.throw(Error);
    });

    it('should throw when set the bit out of range - larger than length', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 3, 3);
        expect(bits.buffer[0]).equals(0);
        expect(bits.length).equals(3);
        expect(bits.startOffset).equals(5);
        var func = bits.setBit.bind(bits, 4);
        expect(func).to.throw(Error);
    });

    it('should throw when set the bit out of range - equals length', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 3, 3);
        expect(bits.buffer[0]).equals(0);
        expect(bits.length).equals(3);
        expect(bits.startOffset).equals(5);
        var func = bits.setBit.bind(bits, 3);
        expect(func).to.throw(Error);
    });

    it('should throw when set the bit out of range - less than zero', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 3, 3);
        expect(bits.buffer[0]).equals(0);
        expect(bits.length).equals(3);
        expect(bits.startOffset).equals(5);
        var func = bits.setBit.bind(bits, -1);
        expect(func).to.throw(Error);
    });

    it('should not throw if the requested length is less than or equal buffer size', function() {
        var buffer = Buffer.from([99]);
        var func = Bits.from.bind(Bits, buffer, 0, 8);
        expect(func).to.not.throw();
    });
});