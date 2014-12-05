"use strict";
var assert = require('assert');
var codec = require('../index');
var jsc = require('jsverify');

// mocha defines to avoid JSHint breakage
/* global describe, it, before, beforeEach, after, afterEach */

var valuePairs = {
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

describe('varints', function() {
    it('value pairs', function() {
        for (var bytes in valuePairs) {
            assert.equal(bytes.toLowerCase(),
                    codec.encodeVarInt(valuePairs[bytes]).toString('hex'));
            assert.equal(valuePairs[bytes],
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
