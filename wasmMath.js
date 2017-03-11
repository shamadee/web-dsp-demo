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
              // cMath['double'] = Module.cwrap('doubler', 'number', ['number']);
              // cMath['fib'] = Module.cwrap('fib', 'number', ['number']);
              // cMath['manipArr'] = Module.cwrap('manipArr', null, ['number', 'number']);
              cMath['manipArr'] = Module.cwrap('manipArr', null, ['number', 'number']);
              cMath['manipSingle'] = Module.cwrap('manipSingle', 'number', ['number']);
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

              cMath['convFilt'] = function(array, width, height) {
                mem = _malloc(array.length);
                HEAPU8.set(array, mem);
                Module._convFilter(mem, width, height);
                const greyScaled = HEAPU8.subarray(mem, mem + array.length);
                _free(mem);
                return greyScaled;
              };

              cMath['gaussFilt'] = function(array, kernel, divisor, width, height) {
                const arLen = array.length;
                const memAdr = _malloc(arLen * Float32Array.BYTES_PER_ELEMENT);
                HEAPF32.set(array, memAdr / Float32Array.BYTES_PER_ELEMENT);
                const kerLen = kernel.length;
                const memKrn = _malloc(kerLen * Float32Array.BYTES_PER_ELEMENT);
                HEAPF32.set(kernel, memKrn / Float32Array.BYTES_PER_ELEMENT);
                // console.log('hi', HEAPF32.subarray(memKrn / Float32Array.BYTES_PER_ELEMENT, memKrn / Float32Array.BYTES_PER_ELEMENT + kerLen));
                
                Module._gaussFilter(memAdr, width, height, memKrn, 1, divisor, 0.0);
                const filtered = HEAPF32.subarray(memAdr / Float32Array.BYTES_PER_ELEMENT, memAdr / Float32Array.BYTES_PER_ELEMENT + arLen);
                // console.log(filtered);
                _free(memAdr);
                _free(memKrn);
                return filtered;
              }

              resolve(cMath);
            };

            document.body.appendChild(script);
        });
  });
}

