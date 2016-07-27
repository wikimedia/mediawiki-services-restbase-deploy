// TODO: Set up real tests
"use strict";

var RU = require('./index');
var switcher = RU.makeRegExpSwitch([
        [/arsta(sat((sarsdta)))/, 'Lots of nesting'],
        'arsda()arstao[3424]',
        [/fo(o)/, 'foo matched!'],
        ['bar', 'bar matched!']
]);

function assert (a, b) {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
        console.error('FAILURE: Expected' , JSON.stringify(b),
                ', saw', JSON.stringify(a));
        process.exit(1);
    }
}

assert( switcher('arstasatsarsdta'),
    { match: ['arstasatsarsdta', 'satsarsdta', 'sarsdta','sarsdta'],
      value: 'Lots of nesting' } );

assert( switcher('foo'),
    { match: ['foo', 'o'],
      value: 'foo matched!' } );

assert( switcher('bar'),
    { match: ['bar', 'bar'],
          value: 'bar matched!' } );

console.log('All tests passed.');
