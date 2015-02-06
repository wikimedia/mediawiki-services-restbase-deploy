"use strict";
var assert = require('assert');
var codec = require('../index');
var jsc = require('jsverify');

// mocha defines to avoid JSHint breakage
/* global describe, it, before, beforeEach, after, afterEach */

var varIntValuePairs = {
    "00": 0,
    "01": 1,
    "ff": -1,
    // Prepended null byte to disambiguate vs. sign bit
    "0080": 128,
    "01000000": 16777216,
    "368972C57A": 234234234234,
    "C9768D3A86": -234234234234,
    // End of the 52-bit mantissa
    "10000000000000": 4503599627370496,
    "F0000000000000": -4503599627370496,
    // These are beyond the 52-bit mantissa of JS Numbers, so we have to pick
    // the examples carefully to work around a lack of precision.
    "FEFFFFFFFFFFFFFE7F": -18446744073709552001,
    "010000000000000180": 18446744073709552000
};

var decimalValuePair = {
    "0000000001": "1",
    "0000000000": "0",
    "000000010C": "1.2",
    "0000000A029C4B647C": "1.1212121212",
    "0000000A0B1D859A843B" : "1222.1423453243",
    "000000070B3A73593407": "1234567.1234567",
    "0000000FFEE6615C297D": "-0.001209547347587",
    "0000001191FE080034D4": "-0.00120954734758700",
    "0000000D03083D16B3": "0.0013023123123",
    "000000073B9ACED2": "100.0001234"
};

describe('varints', function() {
    it('value pairs', function() {
        for (var bytes in varIntValuePairs) {
            assert.equal(bytes.toLowerCase(),
                    codec.encodeVarInt(varIntValuePairs[bytes]).toString('hex'));
            assert.equal(varIntValuePairs[bytes],
                    codec.decodeVarInt(new Buffer(bytes, 'hex')));
        }
    });

    it('small ints', function() {
        // Round-trip tests for small ints
        var t = Math.pow(2,16) + 100;
        for (var i = -t; i < t; i++) {
            if (i && i % 100000 === 0) {
                console.log(i);
            }
            assert.equal(i, codec.decodeVarInt(codec.encodeVarInt(i)));
        }
    });

    jsc.property("random integers", "integer", function (n) {
        var encoded = codec.encodeVarInt(n).toString('hex');
        var decoded = codec.decodeVarInt(new Buffer(encoded, 'hex'));
        return decoded === n;
    });

});

describe('decimal', function() {
    it('value pairs and Round-trip', function() {
        assert.equal(codec.decodeDecimal(codec.encodeDecimal('-1222.142345324')), "-1222.142345324");
        for (var bytes in decimalValuePair) {
            assert.equal(bytes.toLowerCase(), codec.encodeDecimal(decimalValuePair[bytes]).toString('hex'));
            assert.equal(decimalValuePair[bytes], codec.decodeDecimal(new Buffer(bytes, 'hex')));
        }
    });
});