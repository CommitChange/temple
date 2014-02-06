var Emitter = require('emitter-component');
var domify = require('domify');
var assert = require('assert');
var temple = require('../');

suite('html');

describe('loops', function () {

	it("renders an array of strings", function() {
		var el = domify("<div><p data-each='ls' data-text='each'></p></div>");
		var ls = ['finn', 'jake'];
		temple({ls: ls}).render(el);
		var els = el.childNodes;
		// Subtract 1 for the hidden parent node
		assert.equal(els.length - 1, ls.length);
		for (var i = 0; i < ls.length; ++i) {
			assert.equal(els[i].innerHTML, ls[i]);
		}
	});

	it("renders an array of elements", function() {
		var el = domify("<div><p data-each='ls'><span data-text='each'></span></p></div>");
		var ls = ['finn', 'jake'];
		temple({ls: ls}).render(el);
		var els = el.childNodes;
		// Subtract 1 for the hidden parent node
		assert.equal(els.length - 1, ls.length);
		for (var i = 0; i < ls.length; ++i) {
			assert.equal(els[i].firstChild.innerHTML, ls[i]);
		}
	});

	it("renders an array of objects", function() {
		var el = domify("<div><p data-each='buddies' data-text='name'></p></div>");
		var ls = [{name: 'Finn'}, {name: 'Jake'}];
		temple({buddies: ls}).render(el);
		var els = el.childNodes;
		assert.equal(els.length - 1, ls.length);
		for (var i = 0; i < ls.length; ++i) {
			assert.equal(els[i].innerHTML, ls[i].name);
		}
	});

	it("renders nested loops", function() {
		var el = domify('<div><p data-each="nested"><i data-each="sub" data-text="each"></i></p></div>');
		var ls = [{sub: [1, 2]}, {sub: [3, 4]}];
		var data = {nested: ls};
		// {nested: [{sub: [1,2]}, {sub: [3,4]} ] }
		temple(data).render(el);
		var ps = el.childNodes;
		assert.equal(ps.length - 1, ls.length);
		for (var i = 0; i < ls.length; ++i) {
			var is = ps[i].childNodes;
			assert.equal(is.length - 1, ls[i].sub.length);
			for (var j = 0; j < ls[i].sub.length; ++j) {
				assert.equal(is[j].innerHTML, ls[i].sub[j]);
			}
		}
	});

	it("updates loops from events", function() {
		var el = domify("<div><p data-each='ls' data-text='each'></p></div>");
		var ls = ['finn', 'jake'];
		var data = {ls: ls};
		Emitter(data);
		temple(data).render(el);
		var els = el.childNodes;
		assert.equal(els.length - 1, ls.length);
		for (var i = 0; i < ls.length; ++i) {
			assert.equal(els[i].innerHTML, ls[i]);
		}
		ls = ['finn', 'flame princess', 'ice king'];
		data.ls = ls;
		data.emit('change ls');
		assert.equal(els.length - 1, ls.length);
		for (var i = 0; i < ls.length; ++i) {
			assert.equal(els[i].innerHTML, ls[i]);
		}
	});

	it ("renders an empty then longer array", function() {
		var el = domify("<div><p data-each='arr'><span data-text='each'></span></p></div>");
		var arr = [];
		var obj = {arr: []};
		Emitter(obj);
		temple(obj).render(el);
		assert.equal(el.childNodes.length, 1); // 1 for the placeholder
		obj.arr = ['finn', 'jake'];
		obj.emit('change arr');
		assert.equal(el.childNodes.length, 3); // 2 element list + placholder
		for (var i = 0; i < obj.arr.length; ++i) {
			assert.equal(el.childNodes[i].firstChild.innerHTML, obj.arr[i]);
		}
	})

	it('clears out memory', function() {
		var el = domify("<div><p data-each='ls' data-text='each'></p></div>");
		var ls = ['finn', 'jake'];
		var data = {ls: ls};
		Emitter(data);
		var view = temple(data)
		view.render(el);
		assert.equal(view.model.listeners('change ls').length, 1);
		view.clear();
		assert.deepEqual(view.envs, []);
		assert.deepEqual(view.model.listeners('change ls'), []);
	});

});
