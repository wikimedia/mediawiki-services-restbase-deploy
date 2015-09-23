"use strict";
var parser = require('./ExpressionParser');

// See https://github.com/gwicke/tassembly#model-access-and-expressions
var ctxMap = {
    '$': 'rm', // Normally rc.g, but this works better for RESTBase
    '$data': 'm',
    '$root': 'rm',
    '$parent': 'pm',
    '$parents': 'pms',
    '$parentContext': 'pc',
    '$index': 'i',
    '$context': 'c',
    '$rawData': 'd',
    // RESTBase specific mappings
    '$$': 'rc.g',
};

function stringifyObject (obj) {
    if (Array.isArray(obj)) {
        return '[' + obj.map(function(elem) {
            return stringifyObject(elem);
        }).join(',') + ']';
    } else if (obj.constructor === Object) {
        var res = '{',
            keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (i !== 0) {
                res += ',';
            }
            if (/^[a-z_$][a-z0-9_$]*$/.test(key)) {
                res += key + ':';
            } else {
                res += "'" + key.replace(/'/g, "\\'") + "':";
            }
            res += stringifyObject(obj[key]);
        }
        res += '}';
        return res;
    } else if (obj.constructor === Number) {
        return obj;
    } else {
        return obj.toString();
    }
}

function stringifyChildObjects (obj) {
    for (var key in obj) {
        var child = obj[key];
        if (child && child.constructor === Object) {
            obj[key] = stringifyObject(child);
        }
    }
    return obj;
}

var defaultOptions = {
    ctxMap: ctxMap,
    stringifyObject: stringifyObject
};

function parse(input, options) {
    options = options || defaultOptions;
    if (!options.ctxMap) { options.ctxMap = defaultOptions.ctxMap; }
    if (!options.stringifyObject) {
        options.stringifyObject = defaultOptions.stringifyObject;
    }
    // Only parse expressions, not key-value pairs
    options.startRule = 'expression';
    if (typeof input === 'string') {
        return stringifyObject(parser.parse(input, options));
    } else {
        return stringifyObject(parser.parse(stringifyObject(input), options));
    }
}


module.exports = {
    parse: parse,
};

