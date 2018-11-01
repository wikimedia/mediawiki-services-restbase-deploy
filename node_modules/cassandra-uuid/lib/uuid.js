'use strict';

const crypto = require('crypto');

/** @module types */

/**
 * Gets a crypto generated 16 bytes
 * @private
 * @return {Buffer}
 */
function getRandomBytes(cb) {
    return crypto.randomBytes(16, cb);
}

/**
 * @private
 * @return {string} 32 hex representation of the instance, without separators
 */
function getHex(uuid) {
    return uuid.buffer.toString('hex');
}

/**
 * Returns new Uuid
 * @private
 * @return {Uuid}
 */
function createUuidFromBuffer(buffer) {
    // clear the version
    buffer[6] &= 0x0f;
    // set the version 4
    buffer[6] |= 0x40;
    // clear the variant
    buffer[8] &= 0x3f;
    // set the IETF variant
    buffer[8] |= 0x80;
    return new Uuid(buffer);
}

class Uuid {
    /**
     * Creates a new instance of Uuid based on a Buffer
     * @class
     * @classdesc Represents an immutable universally unique identifier (UUID).
     * A UUID represents a 128-bit value.
     * @param {Buffer} buffer The 16-length buffer.
     * @class
     */
    constructor(buffer) {
        if (!buffer || buffer.length !== 16) {
            throw new Error('You must provide a buffer containing 16 bytes');
        }
        this.buffer = buffer;
    }

    /**
     * Gets the bytes representation of a Uuid
     * @return {Buffer}
     */
    getBuffer() {
        return this.buffer;
    }

    /**
     * Compares this object to the specified object.
     * The result is true if and only if the argument is not null, is a UUID object, and
     * contains the same value, bit for bit, as this UUID.
     * @param {Uuid} other The other value to test for equality.
     */
    equals(other) {
        return !!(other instanceof Uuid && this.buffer.toString('hex')
            === other.buffer.toString('hex'));
    }

    /**
     * Returns a string representation of the value of this Uuid instance.
     * 32 hex separated by hyphens, in the form of 00000000-0000-0000-0000-000000000000.
     * @return {string}
     */
    toString() {
        // 32 hex representation of the Buffer
        const hexValue = getHex(this);
        return (
            `${hexValue.substr(0, 8)}-${
                hexValue.substr(8, 4)}-${
                hexValue.substr(12, 4)}-${
                hexValue.substr(16, 4)}-${
                hexValue.substr(20, 12)}`);
    }

    /**
     * Provide the name of the constructor and the string representation
     * @return {string}
     */
    inspect() {
        return `${this.constructor.name}: ${this.toString()}`;
    }

    /**
     * Returns the string representation.
     * Method used by the native JSON.stringify() to serialize this instance.
     */
    toJSON() {
        return this.toString();
    }

    /**
     * Parses a string representation of a Uuid
     * @param {string} value
     * @return {Uuid}
     */
    static fromString(value) {
        // 36 chars: 32 + 4 hyphens
        if (typeof value !== 'string' || value.length !== 36) {
            throw new Error(
                `Invalid string representation of Uuid, 
                it should be in the 00000000-0000-0000-0000-000000000000`
            );
        }
        return new Uuid(Buffer.from(value.replace(/-/g, ''), 'hex'));
    }

    /**
     * Creates a new random (version 4) Uuid.
     * @param {Function} [callback] Optional callback to be invoked with the error
     * as first parameter and the created Uuid as second parameter.
     * @return {Uuid}
     */
    static random(callback) {
        if (callback) {
            getRandomBytes((err, buffer) => {
                if (err) {
                    return callback(err);
                }
                return callback(null, createUuidFromBuffer(buffer));
            });
        } else {
            const buffer = getRandomBytes();
            return createUuidFromBuffer(buffer);
        }
    }
}

module.exports = Uuid;
