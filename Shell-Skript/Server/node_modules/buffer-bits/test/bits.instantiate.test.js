var Bits = require('../lib/index');
var expect = require('chai').expect

describe('Bits instantiate', function() {
    it('should be able to initialize Bits one full byte', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 0, 8);
        expect(bits.buffer[0]).equals(99);
        expect(bits.length).equals(8);
        expect(bits.startOffset).equals(0);
    });

    it('should be able to initialize Bits inside one byte', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 3, 3);
        expect(bits.buffer[0]).equals(0);
        expect(bits.length).equals(3);
        expect(bits.startOffset).equals(5);
    });

    it('should be able to initialize Bits cross one full byte', function() {
        var buffer = Buffer.from([99, 98]);
        var bits = Bits.from(buffer, 3, 8);
        expect(bits.buffer[0]).equals(27);
        expect(bits.length).equals(8);
        expect(bits.startOffset).equals(0);
    });

    it('should be able to initialize Bits cross more than one full byte', function() {
        var buffer = Buffer.from([99, 98]);
        var bits = Bits.from(buffer, 3, 9);
        expect(bits.buffer[0]).equals(0);
        expect(bits.buffer[1]).equals(54);
        expect(bits.length).equals(9);
        expect(bits.startOffset).equals(7);
    });

    it('should be able to initialize Bits cross two full byte', function() {
        var buffer = Buffer.from([99, 98, 97]);
        var bits = Bits.from(buffer, 3, 16);
        expect(bits.buffer[0]).equals(27);
        expect(bits.buffer[1]).equals(19);
        expect(bits.length).equals(16);
        expect(bits.startOffset).equals(0);
    });

    it('should be able to initialize Bits cross more than two full byte', function() {
        var buffer = Buffer.from([99, 98, 97]);
        var bits = Bits.from(buffer, 3, 19);
        expect(bits.buffer[0]).equals(0);
        expect(bits.buffer[1]).equals(216);
        expect(bits.buffer[2]).equals(152);
        expect(bits.length).equals(19);
        expect(bits.startOffset).equals(5);
    });

    it('should be able to initialize Bits inside one byte without moving bits', function() {
        var buffer = Buffer.from([99]);
        var bits = Bits.from(buffer, 1, 7);
        expect(bits.buffer[0]).equals(99);
        expect(bits.length).equals(7);
        expect(bits.startOffset).equals(1);
    });

    it('should be able to initialize Bits inside two byte without moving bits', function() {
        var buffer = Buffer.from([99, 98]);
        var bits = Bits.from(buffer, 1, 15);
        expect(bits.buffer[0]).equals(99);
        expect(bits.buffer[1]).equals(98);
        expect(bits.length).equals(15);
        expect(bits.startOffset).equals(1);
    });

    it('should be able to initialize Bits inside two byte without moving bits and not the ending', function() {
        var buffer = Buffer.from([99, 98, 97, 96]);
        var bits = Bits.from(buffer, 1, 15);
        expect(bits.buffer[0]).equals(99);
        expect(bits.buffer[1]).equals(98);
        expect(bits.length).equals(15);
        expect(bits.byteLength).equals(2);
        expect(bits.startOffset).equals(1);
    });

    it('should be able to initialize Bits inside two byte without moving bits and not the ending - with 8x length', function() {
        var buffer = Buffer.from([99, 98, 97, 96]);
        var bits = Bits.from(buffer, 8, 16);
        expect(bits.buffer[0]).equals(98);
        expect(bits.buffer[1]).equals(97);
        expect(bits.length).equals(16);
        expect(bits.byteLength).equals(2);
        expect(bits.startOffset).equals(0);
    });

    it('should be able to initialize Bits with optional parameters - startOffset', function() {
        var buffer = Buffer.from([99, 98, 97, 96]);
        var bits = Bits.from(buffer);
        expect(bits.buffer[0]).equals(99);
        expect(bits.buffer[1]).equals(98);
        expect(bits.buffer[2]).equals(97);
        expect(bits.buffer[3]).equals(96);
        expect(bits.length).equals(32);
        expect(bits.startOffset).equals(0);
        expect(bits.byteLength).equals(4);
    });

    it('should be able to initialize Bits with optional parameters - length', function() {
        var buffer = Buffer.from([99, 98, 97, 96]);
        var bits = Bits.from(buffer, 8);
        expect(bits.buffer[0]).equals(98);
        expect(bits.buffer[1]).equals(97);
        expect(bits.buffer[2]).equals(96);
        expect(bits.length).equals(24);
        expect(bits.startOffset).equals(0);
        expect(bits.byteLength).equals(3);
    });

    it('should be able to be allocated directly', function() {
        var bits = Bits.alloc(5);
        expect(bits.length).equals(5);
        expect(bits.byteLength).equals(1);
        expect(bits.startOffset).equals(3);
        expect(bits.readInt()).equals(0);
        expect(bits.readBit(3)).to.be.false;
        bits.setBit(3, true);
        expect(bits.readBit(3)).to.be.true;
        expect(bits.readInt()).equals(2);
    });

    it('should be able to be allocated with zero length', function() {
        var bits = Bits.alloc(0);
        expect(bits.length).equals(0);
        expect(bits.byteLength).equals(0);
        expect(bits.startOffset).equals(0);
        expect(bits.readInt()).to.be.undefined;
    });

    describe('from another Bits', function() {
        it('should be able to initalize Bit from another Bits', function() {
            var anotherBits = Bits.from(Buffer.from([98]), 0, 5);
            var bits = Bits.from(anotherBits, 0, 3);
            expect(bits.buffer[0]).equals(3);
            expect(bits.startOffset).equals(5);
            expect(bits.length).equals(3);

            bits = Bits.from(anotherBits, 0, 2);
            expect(bits.buffer[0]).equals(1);
            expect(bits.startOffset).equals(6);
            expect(bits.length).equals(2);
        });

        it('should be able to initalize Bit from another Bits with optional parameters - startOffset', function() {
            var anotherBits = Bits.from(Buffer.from([98]), 0, 5);
            var bits = Bits.from(anotherBits);
            expect(bits.equals(anotherBits)).to.be.true;
        });

        it('should be able to initalize Bit from another Bits with optional parameters - length', function() {
            var anotherBits = Bits.from(Buffer.from([98]), 0, 5);
            var bits = Bits.from(anotherBits, 1);
            expect(bits.buffer[0]).equals(12);
            expect(bits.startOffset).equals(4);
            expect(bits.length).equals(4);
        });
    });
});