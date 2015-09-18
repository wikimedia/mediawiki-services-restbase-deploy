var assert = require('assert');
var parser = require('../index.js');

// Notes
// - goal: compile to one big object literal
// - need to parse {placeholder}s
// - need self-executing function or expression for each value

var testCases = [
{
    expression: '{a: {A: 2,\n b: $parentContext.$data.foo[4].bar({\n"fo\'o":\nbar[3]}) .baz }}',
    tassembly: "{a:{'A':2,b:pc.m.foo[4].bar({'fo\\'o':m.bar[3]}).baz}}",
},
{
    expression: "{res:$data.foo-bar.baz,foo:'bar'}",
    tassembly: "{res:m['foo-bar'].baz,foo:'bar'}",
},
{
    expression: '$.request.headers.content-type',
    tassembly: "rm.request.headers['content-type']",
},
{
    expression: {headers:{'content-type': '$.request.headers.content-type'}},
    tassembly: "{headers:{'content-type':rm.request.headers['content-type']}}",
},
{
    expression: {headers:{"content-type": "$$.default($.request.headers.content-type,'text/html')"}},
    tassembly: "{headers:{'content-type':rc.g.default(rm.request.headers['content-type'],'text/html')}}",
},
{
    expression: {headers:{"content-type": "$$.default($.request.headers.content-type,'text/html')"}},
    tassembly: "{headers:{'content-type':rc.g.default(rm.request.headers['content-type'],'text/html')}}",
},
{
    name: 'Call a function from the model',
    expression: "default($.request.headers.content-type,'text/html')",
    tassembly: "m.default(rm.request.headers['content-type'],'text/html')",
},
{
    name: 'Call a function from the model, complex default value',
    expression: "default($.request.headers,{content-type: 'text/html', x-forwarded-for: $.request.headers.x-forwarded-for})",
    tassembly: "m.default(rm.request.headers,{'content-type':'text/html','x-forwarded-for':rm.request.headers['x-forwarded-for']})",
},
];


function runCase(testCase) {
    assert.equal(parser.parse(testCase.expression), testCase.tassembly);
}
var cases = {};
testCases.forEach(function(tc) {
    var i = !cases[tc.name] && tc.name || tc.tassembly;
    cases[i] = runCase.bind(null, tc);
});

module.exports = {
    Parsing: cases
};
