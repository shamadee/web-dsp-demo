var Module = {};
function loadWASM () {
  const cMath = {};
  return new Promise((resolve, reject) => {
    fetch('cMath.wasm')
        .then(response => response.arrayBuffer())
        .then(buffer => {
            Module.wasmBinary = buffer;
            var script = document.createElement('script');
            script.src = 'cMath.js';
            script.onload = function () {
              console.log('Emscripten boilerplate loaded.');
              cMath['double'] = Module.cwrap('doubler', 'number', ['number']);
              cMath['fib'] = Module.cwrap('fib', 'number', ['number']);
              cMath['manipArr'] = Module.cwrap('manipArr', null, ['number', 'number']);
              cMath['greyScale'] = Module.cwrap('greyScale', null, ['number', 'number']);
              resolve(cMath);
            };
            document.body.appendChild(script);
        });
  });
}

