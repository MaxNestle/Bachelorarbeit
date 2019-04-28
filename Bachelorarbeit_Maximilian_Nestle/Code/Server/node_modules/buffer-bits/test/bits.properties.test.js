var Bits = require('../lib/index');
var expect = require('chai').expect;

describe('Bits properties', function() {

    describe('isFullByte', function() {
        it('should be able to see if the Bits are not of a full byte', function() {
            var buffer = Buffer.from([99, 98]);
            var bits = Bits.from(buffer, 3, 9);
            expect(bits.isFullByte).to.be.false;
        });

        it('should be able to see if the Bits are of a full byte', function() {
            var buffer = Buffer.from([99, 98]);
            var bits = Bits.from(buffer, 3, 8);
            expect(bits.isFullByte).to.be.true;
        });
    });

    describe('isAligned', function() {
        it('should be able to see if the bits can be aligned', function() {
            var buffer = Buffer.from([99, 98]);
            var bits = Bits.from(buffer, 3, 9);
            expect(bits.isLeftAligned).to.be.false;
            expect(bits.isRightAligned).to.be.true;
            bits.alignLeft();
            expect(bits.isLeftAligned).to.be.true;
        });

        it('should be able to see if the bits\' alignment wont be affected after read int or string', function() {
            var buffer = Buffer.from([99, 98]);
            var bits = Bits.from(buffer, 3, 9);
            expect(bits.isLeftAligned).to.be.false;
            expect(bits.isRightAligned).to.be.true;
            expect(bits.readInt()).equals(54);
            bits.alignLeft();
            expect(bits.isLeftAligned).to.be.true;
            expect(bits.readInt()).equals(54);
            expect(bits.isLeftAligned).to.be.true;
            expect(bits.readString()).equals('\x1b\x00');
            expect(bits.isLeftAligned).to.be.true;
            bits.alignRight();
            expect(bits.isRightAligned).to.be.true;
            expect(bits.readString()).equals('\x1b\x00');
            expect(bits.isRightAligned).to.be.true;
        });
    });
});