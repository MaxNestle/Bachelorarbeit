import BitEncode from 'bit-encode'
import BufferShift from 'buffershift'

const BARS = [0, 1, 3, 7, 15, 31, 63, 127, 255]

function getBARS(count) {
    return BARS[count]
}

exports = module.exports = class Bits {


    /**
     * Creates an instance of Bits.
     * @deprecated Don't use new Bits, there's no params checking here
     * @param {any} buffer 
     * @param {any} offset 
     * @param {any} length 
     * 
     * @memberof Bits
     */
    constructor(buffer, offset, length) {
        this._isLeftAligned = false
        this._length = length

        // offset = 0, length = buffer.length, just copy...
        if (offset == 0 && length == (buffer.length << 3)) {
            this._buffer = Buffer.alloc(buffer.length)
            buffer.copy(this._buffer, 0, 0, buffer.length)
            this._startOffset = 0
            this._byteLength = buffer.length
            return
        }

        // byteLength for allocating the new Buffer
        let byteLength = ((length - 1) >> 3) + 1

        // (offset + length) & 7 == 0, just copy, too
        if (((offset + length) & BARS[3]) == 0) {
            this._buffer = Buffer.alloc(byteLength)
            buffer.copy(this._buffer, 0, offset >> 3, (offset + length) >> 3)
            this._startOffset = offset & BARS[3]
            if (byteLength > 0) {
                this._buffer[0] &= BARS[8 - this._startOffset]
            }
            this._byteLength = byteLength
            return
        }

        // byteOffset is the byte position inside the buffer
        let lastOffset = offset + length
        this._buffer = Buffer.alloc(byteLength)

        let count = byteLength;
        while (lastOffset >= offset) {
            let nextOffset = lastOffset - 8
            if (nextOffset <= offset) {
                // less than one byte left
                nextOffset = offset
            }
            let lastByteOffset = (lastOffset - 1) >> 3
            let nextByteOffset = (nextOffset - 1) >> 3
            let lastBitOffset = lastOffset & BARS[3]
            let nextBitOffset = nextOffset & BARS[3]
            let byteValue = 0
            if (lastByteOffset == nextByteOffset) {
                // in the same byte
                byteValue = (buffer[lastByteOffset] >> (8 - lastBitOffset)) & BARS[lastBitOffset - nextBitOffset]
            } else {
                // cutted byte
                byteValue = ((buffer[nextByteOffset] & BARS[(8 - nextBitOffset)]) << nextBitOffset) + (buffer[lastByteOffset] >> (8 - lastBitOffset))
            }

            // put the byteValue to our new buffer
            this._buffer[count-- - 1] = byteValue
            lastOffset -= 8
        }

        this._startOffset = (byteLength << 3) - length
        this._byteLength = byteLength
    }

    /**
     * Initialize the Bits object
     * 
     * @static
     * @param {Buffer|Bits} buffer 
     * @param {Number} offset 
     * @param {Number} length 
     * 
     * @memberof Bits
     */
    static from(buffer, offset, length) {
        if (!(buffer instanceof Buffer || buffer instanceof Bits)) {
            throw new Error('Invalid type \'buffer\', should be either a [Buffer] or [Bits]')
        }
        if (offset === undefined) {
            offset = 0
        }
        let buf = null
        let bufBitsLength = null
        let bufLength = null
        let startOffset = offset
        let len = length
        if (buffer instanceof Buffer) {
            buf = buffer
            bufBitsLength = buffer.length << 3
            bufLength = bufBitsLength
        } else if (buffer instanceof Bits) {
            buf = buffer.buffer
            bufBitsLength = buffer.length
            bufLength = buf.length << 3
            startOffset = buffer.startOffset + offset
        } else {
            return undefined
        }

        if (length === undefined) {
            len = bufBitsLength - offset
        }

        if ((bufBitsLength) < len || (bufLength) < (startOffset + len)) {
            throw new Error('Out Of range')
        }

        return new Bits(buf, startOffset, len)
    }


    /**
     * Alloc a Bits object with bit length set
     * 
     * @static
     * @param {Number} length 
     */
    static alloc(length) {
        let byteLength = ((length - 1) >> 3) + 1
        let buffer = Buffer.alloc(byteLength)
        return Bits.from(buffer, (byteLength << 3) - length, length)
    }


    /**
     * Build new Bits object by concat another Bits
     * 
     * @param {any} anotherBits 
     * @returns 
     * 
     * @memberof Bits
     */
    concat(anotherBits) {
        if (anotherBits.startOffset == 0) {
            // no bits move
            let buff = Buffer.alloc(this._byteLength + anotherBits.byteLength)
            anotherBits.buffer.copy(buff, this._byteLength, 0, anotherBits.byteLength)
            this._buffer.copy(buff, 0, 0, this._byteLength)
            return Bits.from(buff, this._startOffset, (buff.length << 3) - this._startOffset)
        } else {
            // need to move bits...
            let totalBitLength = this._length + anotherBits.length
            let buffByteLength = ((totalBitLength - 1) >> 3) + 1
            let isSmaller = false
            if (buffByteLength < this._byteLength + anotherBits.byteLength) {
                isSmaller = true
            }
            let buff = Buffer.alloc(buffByteLength)
            // still copy the right Bits
            anotherBits.buffer.copy(buff, buffByteLength - anotherBits.byteLength, 0, anotherBits.byteLength)
            for (let i = this._byteLength - 1; i >= 0; i--) {
                if (isSmaller) {
                    buff[i] += (this._buffer[i] << (8 - anotherBits.startOffset))
                } else {
                    buff[i + 1] += (this._buffer[i] << (8 - anotherBits.startOffset))
                    if (i == 0) {
                        // need to put the first byte in buff
                        buff[0] = this._buffer[0] >> anotherBits.startOffset
                    }
                }
            }
            return Bits.from(buff, (buff.length << 3) - totalBitLength, totalBitLength)
        }
    }

    get length() {
        return this._length
    }

    get buffer() {
        return this._buffer
    }

    get startOffset() {
        return this._startOffset
    }

    get byteLength() {
        return this._byteLength
    }

    get isLeftAligned() {
        return this._isLeftAligned
    }

    get isRightAligned() {
        return !this._isLeftAligned
    }

    get isFullByte() {
        return (this._length & BARS[3]) === 0
    }

    readInt() {
        let result = undefined
        if (this._isLeftAligned) {
            this.alignRight()
            result = this._buffer.readIntBE(0, this._byteLength)
            this.alignLeft()
        } else {
            result = this._buffer.readIntBE(0, this._byteLength)
        }
        return result
    }

    readUInt() {
        let result = undefined
        if (this._isLeftAligned) {
            this.alignRight()
            result = this._buffer.readUIntBE(0, this._byteLength)
            this.alignLeft()
        } else {
            result = this._buffer.readUIntBE(0, this._byteLength)
        }
        return result
    }

    readIntLE() {
        let result = undefined
        if (this._isLeftAligned) {
            this.alignRight()
            result = this._buffer.readIntLE(0, this._byteLength)
            this.alignLeft()
        } else {
            result = this._buffer.readIntLE(0, this._byteLength)
        }
        return result
    }

    readUIntLE() {
        let result = undefined
        if (this._isLeftAligned) {
            this.alignRight()
            result = this._buffer.readUIntLE(0, this._byteLength)
            this.alignLeft()
        } else {
            result = this._buffer.readUIntLE(0, this._byteLength)
        }
        return result
    }

    readString(encoding, start, end) {
        let result = undefined
        if (!this._isLeftAligned) {
            this.alignLeft()
            result = this._buffer.toString(encoding, start, end)
            this.alignRight()
        } else {
            result = this._buffer.toString(encoding, start, end)
        }
        return result
    }

    readBit(index) {
        if (index >= this.length || index < 0) {
            throw new Error('Out of range')
        }
        return BitEncode.get(this._buffer, this._startOffset + index)
    }

    setBit(index, value) {
        if (index >= this.length || index < 0) {
            throw new Error('Out of range')
        }
        BitEncode.set(this._buffer, this._startOffset + index, value)
    }

    toggleBit(index) {
        if (index >= this.length || index < 0) {
            throw new Error('Out of range')
        }
        // BitEncode.set(this._buffer,
        //     this._startOffset + index,
        //     !BitEncode.get(this._buffer, this._startOffset + index))

        let byteOffset = (this._startOffset + index) >> 3
        let bitOffset = (this.startOffset + index) & BARS[3]
        this._buffer[byteOffset] ^= (1 << (7 - bitOffset))
    }

    alignLeft() {
        this.align(true)
    }

    alignRight() {
        this.align(false)
    }

    align(isLeftAligned) {
        let bufBitsLength = this._byteLength << 3
        if (this._isLeftAligned && !isLeftAligned && this._length < bufBitsLength) {
            // need to align right
            let shiftBitsLength = bufBitsLength - this._length
            BufferShift.shr(this._buffer, shiftBitsLength)
            this._startOffset = shiftBitsLength
            this._isLeftAligned = false
        }

        if (!this._isLeftAligned && isLeftAligned && this._length < bufBitsLength) {
            // need to align left
            BufferShift.shl(this._buffer, bufBitsLength - this._length)
            this._startOffset = 0
            this._isLeftAligned = true
        }

        // else do nothing
    }

    toggleAll() {
        for (let i = 0; i < this._byteLength; i++) {
            this._buffer[i] ^= BARS[8]
        }
    }

    toString() {
        return '[Bits Object]'
    }

    toBinaryString() {
        let binString = '';
        for (let i = 0; i < this._length; i++) {
            binString += this.readBit(i) ? '1' : '0'
        }
        return '0b' + binString
    }

    equals(anotherBits) {
        if (anotherBits instanceof Bits) {
            if (this._length != anotherBits.length) {
                return false;
            }

            for (let i = 0; i < this._byteLength; i++) {
                if (i == 0) {
                    if ((this._buffer[0] ^ anotherBits.buffer[0]) & BARS[8 - this._startOffset] != 0) {
                        return false;
                    }
                } else {
                    if ((this._buffer[i] ^ anotherBits.buffer[i]) != 0) {
                        return false;
                    }
                }
            }
        } else {
            return false
        }

        return true
    }
}