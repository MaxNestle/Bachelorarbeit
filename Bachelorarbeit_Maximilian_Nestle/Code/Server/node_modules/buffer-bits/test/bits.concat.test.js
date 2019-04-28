var Bits = require('../lib/index');
var expect = require('chai').expect

describe('Bits concat', function() {
    it('should be able to concat another Bits (8x bits, bytes)', function() {
        var bits = Bits.from(Buffer.from([99]), 0, 3);
        var anotherBits = Bits.from(Buffer.from([98]), 0, 8); //full bits
        var result = bits.concat(anotherBits);
        expect(result.buffer[0]).equals(3);
        expect(result.buffer[1]).equals(98);
        expect(result.readInt()).equals(866);
        expect(result.startOffset).equals(5);
    });

    it('should be able to concat another Bits (totally less than 1 byte)', function() {
        var bits = Bits.from(Buffer.from([99]), 0, 3);
        var anotherBits = Bits.from(Buffer.from([98]), 0, 4);
        var result = bits.concat(anotherBits);
        expect(result.byteLength).equals(1);    // only 1 byte
        expect(result.startOffset).equals(1);
        expect(result.buffer[0]).equals(54);
        expect(result.readInt()).equals(54);
    });

    it('should be able to concat another Bits (totally equals 1 byte)', function() {
        var bits = Bits.from(Buffer.from([99]), 0, 4);
        var anotherBits = Bits.from(Buffer.from([98]), 0, 4);
        var result = bits.concat(anotherBits);
        expect(result.byteLength).equals(1);    // only 1 byte
        expect(result.startOffset).equals(0);
        expect(result.buffer[0]).equals(102);
        expect(result.readInt()).equals(102);
    });

    it('should be able to concat another Bits (totally greater than 1 byte)', function() {
        var bits = Bits.from(Buffer.from([99]), 0, 4);
        var anotherBits = Bits.from(Buffer.from([98]), 0, 5);
        var result = bits.concat(anotherBits);
        expect(result.byteLength).equals(2);
        expect(result.length).equals(9);
        expect(result.startOffset).equals(7);
        expect(result.buffer[0]).equals(0);
        expect(result.buffer[1]).equals(204);
        expect(result.readInt()).equals(204);
    });
});