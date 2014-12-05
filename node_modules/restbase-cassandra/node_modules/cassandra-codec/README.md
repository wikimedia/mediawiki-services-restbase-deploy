# Cassandra / Java number encoding and decoding
[![Build Status](https://travis-ci.org/wikimedia/cassandra-codec?branch=master)](https://travis-ci.org/wikimedia/cassandra-codec)

## Usage:

```bash
npm install cassandra-codec
```

### `#encodeVarInt(i: Number): Buffer`

Encodes a JavaScript `Number` into a `Buffer`, using the same format as
`java.math.BigInteger`'s `toByteArray()` method.

### `#decodeVarInt(b: Buffer): Number`

Decodes a `Buffer` holding a Varint in `java.math.BigInteger`'s
`toByteArray()` format into a JavaScript `Number`.

## License
MIT.
