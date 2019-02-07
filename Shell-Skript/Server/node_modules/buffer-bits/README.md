# buffer-bits

[![Build Status](https://travis-ci.org/strawhatboy/buffer-bits.svg?branch=master)](https://travis-ci.org/strawhatboy/buffer-bits)

This component is able to hold a set of bits (NOT bytes) and do operations on them. Could be used to analyze some protocol by yourself...

## Quick Example
```js
var Bits = require('buffer-bits');
var myBuffer = Buffer.from([20, 30, 40, 50]);

// starting from bit offset 3
// and capture 26 bits after
var myBits = Bits.from(myBuffer, 3, 26);    

console.log(myBits.toBinaryString());
// 0b10100000111100010100000110
```

## Features

1. Class Methods
    * Bits.from(buffer [, offset = 0 [, length = buffer.length << 3 ]]) 
        - create Bits from existing Buffer object
    * Bits.from(bits [, offset = 0 [, length = bits.length ]])
        - create Bits from existing Bits object
    * Bits.alloc(length)
        - create Bits with count of bits and filled with 0
2. Constructor
    * new Bits(buffer, offset, length) *
        - there's __NO__ params validating in this constructor, please __DON'T__ use it for creating new instance...
2. Properties (read-only)
    * length
        - count of the total bits
    * byteLength
        - total bytes the Bits object holds
    * isFullByte
        - return true if total bits count is a multiple of 8 
    * buffer
        - inner Buffer object hold by Bits. Take care to __NOT__ write to this buffer directly.
    * startOffset *
        - represents the start bit offset inside the byte. This property should be __RARELY__ used, use it when you know what you're doing...
    * isLeftAligned *
        - represents if all the bits are left aligned in the inner buffer, __RARELY__
    * isRightAligned *
        - represents if all the bits are right aligned in the inner buffer, __RARELY__
3. Methods
    * readInt()
        - read integer value of current bits (_big endian_)
    * readIntLE()
        - read integer value of current bits with _little endian_
    * readUInt()
        - read unsigned integer value of current bits (_big endian_)
    * readUIntLE()
        - read unsigned integer value of current bits with _little endian_
    * readString([encoding[, start[, end]]])
        - read string from the bits, same as [buf.toString](https://nodejs.org/api/buffer.html#buffer_buf_tostring_encoding_start_end)
    * readBit(index)
        - read the bit value (1: true, 0: false) at position 'index'
    * setBit(index, value)
        - set the bit value (1: true, 0: false) at position 'index'
    * toggleBit(index)
        - toggle the bit value at position 'index', 1->0, 0->1
    * toggleAll()
        - toggle all the bits
    * concat(Bits)
        - create Bits by concating another Bits object
    * toBinaryString()
        - return a '0b\<binaryData\>' format string, like 0b110101010
    * equals(Bits)
        - return true if all bits equals to another Bits object
    * align(Boolean) *
        - align all the bits inside the inner buffer to the left(`true`) or right(`false`) side
    * alignLeft() *
        - align all the bits in the inner buffer to the left side
    * alignRight() *
        - align all the bits in the inner buffer to the right side

## More Examples
```js
console.log(myBits.length);
// 26

console.log(myBits.byteLength);
// 4

console.log(myBits.startOffset);
// 6

console.log(myBits.buffer);
// <Buffer 02 83 c5 06>

console.log(myBits.readInt());
// 42190086

console.log(myBits.readBit(20));
// false

myBits.setBit(20, true);
console.log(myBits.readBit(20));
// true
```

## More More Examples
Please check the tests in `test` folder to see more details.

## License
MIT