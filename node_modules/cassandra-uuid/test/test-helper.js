"use strict";

const assert = require('assert');

function noop() {}

const helper = {
/**
 * @param {number} count
 * @param {Function} iteratorFunc
 * @param {Function} [callback]
 */
    times(count, iteratorFunc, callback) {
        callback = callback || noop;
        count = +count;
        if (isNaN(count) || count === 0) {
            return callback();
        }
        let completed = 0;
        function next(err) {
            if (err) {
                const cb = callback;
                callback = noop;
                return cb(err);
            }
            if (++completed !== count) {
                return;
            }
            callback();
        }
        for (let i = 0; i < count; i++) {
            iteratorFunc(i, next);
        }
    },
    assertInstanceOf(instance, constructor) {
        assert.notEqual(instance, null, `Expected instance, obtained ${instance}`);
        assert.ok(instance instanceof constructor, `Expected instance of ${constructor.name}, 
        actual constructor: ${instance.constructor.name}`);
    },
};

module.exports = helper;
