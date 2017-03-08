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
              console.log('Module', Module);
              console.log('Emscripten boilerplate loaded.');
              // cMath['double'] = Module.cwrap('doubler', 'number', ['number']);
              // cMath['fib'] = Module.cwrap('fib', 'number', ['number']);
              // cMath['manipArr'] = Module.cwrap('manipArr', null, ['number', 'number']);
              cMath['doubler'] = _doubler;
              cMath['fib'] = _fib;
              cMath['greyScale'] = function(array) {
                mem = _malloc(array.length);
                HEAPU8.set(array, mem);
                Module._greyScale(mem, array.length);
                const greyScaled = HEAPU8.subarray(mem, mem + array.length);
                _free(mem);
                return greyScaled;
              };

              cMath['manipArr'] = Module.cwrap('manipArr', null, ['number', 'number']);

              resolve(cMath);
            };
            document.body.appendChild(script);
        });
  });
}

