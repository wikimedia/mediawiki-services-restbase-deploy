"use strict";

var RU = {};

RU.isRegExp = function (re) {
    return re && re.constructor === RegExp;
};

/**
 * Return the regexp source of either a regexp or a regexp matching a
 * passed-in string.
 */
RU.toSource = function (re) {
    if (RU.isRegExp(re)) {
        return re.source;
    } else {
        return RU.escapeRegExp(re);
    }
};

/**
 * Escape special regexp characters in a string used to build a regexp
 */
RU.escapeRegExp = function(re) {
	return re.replace(/[\^\\$*+?.()|{}\[\]\/]/g, '\\$&');
};

var OPEN_GROUP = /(^|[^\\])\((?!\?:)/;
/**
 * Convert all capturing groups in a regexp string into non-capturing ones
 *
 * FIXME: Don't match parens in char classes
 */
RU.makeGroupsNonCapturing = function (re) {
    // Make capturing groups non-capturing
    var match = re.match(OPEN_GROUP);
    while (match) {
        re = re.replace(OPEN_GROUP, '$1(?:');
        match = re.match(OPEN_GROUP);
    }
    return re;
};

/**
 * Determine how many capturing groups a regexp contains
 */
RU.countCapturingGroups = function numberOfGroups (re) {
    // Construct a regexp that always matches
    var testRe = new RegExp('|' + re);
    // And use the length of the result to determine the number of groups
    return ''.match(testRe).length - 1;
};

/**
 * Build a regexp-based switch
 *
 * Creates a single regexp matcher function from matcher objects with a
 * 'pattern' regexp property.
 * {
 *      pattern: /^fo(o)/
 * }
 *
 * The returned matcher can then be applied to an input string, and yields
 * either null if nothing matched, or a result object like this:
 *
 * {
 *      match: [ 'foo', 'o', index: 0, input: 'foo' ],
 *      matcher: {} // the original matcher object
 * }
 *
 * */
RU.makeRegExpSwitch = function (matchers) {
    var reBits = [],
        matcherOffsetMap = {}, // Map group offset -> matcher
        reOffset = 0,
        reBit;
    matchers.forEach(function(matcher) {
        var re = matcher.pattern;
        reBit = RU.toSource(re);
        if (re.length === undefined) {
            re.length = RU.countCapturingGroups(reBit);
        }
        matcherOffsetMap[reOffset] = matcher;
        reOffset += re.length + 1;
        reBits.push('(' + reBit + ')');
    });
    var switchRe = new RegExp(reBits.join('|'));
    return function regExpSwitcher (s) {
        var match = switchRe.exec(s);
        if (match) {
            var i = 1, l = match.length;
            for (; i < l; i++) {
                if (match[i] !== undefined) {
                    break;
                }
            }
            var matcher = matcherOffsetMap[i-1];
            // extract the capturing group results
            var newMatch = match.slice(i, i + matcherOffsetMap[i-1].pattern.length + 1);
            newMatch.index = match.index;
            newMatch.input = s;
            match = newMatch;
            return {
                match: match,
                matcher: matcher
            };
        } else {
            return null;
        }
    };
};


module.exports = RU;
