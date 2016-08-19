'use strict';

function Editor( config ) {
  function F() {};
  F.prototype = EditorPrototype;

  var f = new F();

  f.config = config;

  return f;
}
