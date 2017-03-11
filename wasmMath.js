var Module = {};
function loadWASM () {
  const cMath = {};
  return new Promise((resolve, reject) => {
    fetch('cMath.wasm')
        .then(response => {
          return response.arrayBuffer();
        })
        .then(buffer => {
            Module.wasmBinary = buffer;

            var script = document.createElement('script');
            script.src = 'cMath.js';

            script.onload = function () {
              if (!WebAssembly.instantiate) {
                console.log('couldnt load WASM');
                let newObj = { test: "this is working" };
                reject(newObj);
              }
              console.log('Emscripten boilerplate loaded.');
              
              cMath['doubler'] = _doubler;
              cMath['fib'] = _fib;

              //filters
              cMath['grayScale'] = function(array) {
                mem = _malloc(array.length);
                HEAPU8.set(array, mem);
                Module._grayScale(mem, array.length);
                const grayScaled = HEAPU8.subarray(mem, mem + array.length);
                _free(mem);
                return grayScaled;
              };
              cMath['sobelFilter'] = function(array, width, height) {
                mem = _malloc(array.length);
                HEAPU8.set(array, mem);
                Module._sobelFilter(mem, width, height);
                const filtered = HEAPU8.subarray(mem, mem + array.length);
                _free(mem);
                return filtered;
              };
              cMath['brighten'] = function(array, brightness = 25) {
                mem = _malloc(array.length);
                HEAPU8.set(array, mem);
                Module._brighten(mem, array.length, brightness);
                const brighten = HEAPU8.subarray(mem, mem + array.length);
                _free(mem);
                return brighten;
              };
              cMath['invert'] = function(array) {
                mem = _malloc(array.length);
                HEAPU8.set(array, mem);
                Module._invert(mem, array.length);
                const invert = HEAPU8.subarray(mem, mem + array.length);
                _free(mem);
                return invert;
              };
              cMath['noise'] = function(array) {
                mem = _malloc(array.length);
                HEAPU8.set(array, mem);
                Module._noise(mem, array.length);
                const noise = HEAPU8.subarray(mem, mem + array.length);
                _free(mem);
                return noise;
              };
              cMath['edgeManip'] = function(array, filt, c2Width) {
                mem = _malloc(array.length);
                HEAPU8.set(array, mem);
                Module._edgeManip(mem, array.length, filt, c2Width);
                const edgeManip = HEAPU8.subarray(mem, mem + array.length);
                _free(mem);
                return edgeManip;
              };
              cMath['convFilter'] = function(array, kernel, count, divisor, width, height) {
                const arLen = array.length;
                const memAdr = _malloc(arLen * Float32Array.BYTES_PER_ELEMENT);
                HEAPF32.set(array, memAdr / Float32Array.BYTES_PER_ELEMENT);
                const kerLen = kernel.length;
                const memKrn = _malloc(kerLen * Float32Array.BYTES_PER_ELEMENT);
                HEAPF32.set(kernel, memKrn / Float32Array.BYTES_PER_ELEMENT);
                Module._convFilter(memAdr, width, height, memKrn, 1, divisor, 0.0, count);
                const filtered = HEAPF32.subarray(memAdr / Float32Array.BYTES_PER_ELEMENT, memAdr / Float32Array.BYTES_PER_ELEMENT + arLen);
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
