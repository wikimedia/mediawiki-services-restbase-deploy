var ta = require('./tassembly.js');

var startTime = new Date(),
	vars = {},
	template = ta.compile(['<div',['attr',{id:"rm.echo('a [m.foo')"}],'>',['text','m.body'],'</div>']);
	vars.echo = function(e) {
		return e;
	};
for ( n=0; n <= 100000; ++n ) {
	vars.id = "divid";
	vars.body = 'my div\'s body';
	html = template(vars);
}
console.log("time: " + ((new Date() - startTime) / 1000));
console.log(html);
