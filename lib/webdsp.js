var Module = {};
function loadWASM() {
  let wam = {};
  return new Promise((resolve, reject) => {
    fetch('./lib/webdsp_c.wasm')
      .then(response => {
        return response.arrayBuffer();
      })
      .then(buffer => {
        if (!('WebAssembly' in window)) {
          console.log('Couldn\'t load WASM, loading JS Fallback');
          wam = jsFallback();
          return resolve(wam);
        }
        Module.wasmBinary = buffer;
        const script = document.createElement('script');
        script.src = './lib/webdsp_c.js';
        script.onload = function () {
          console.log('Emscripten boilerplate loaded.');
          // filters
          wam['grayScale'] = function (pixelData) {
            const len = pixelData.length
            const mem = _malloc(len);
            HEAPU8.set(pixelData, mem); 
            _grayScale(mem, len);
            const filtered = HEAPU8.subarray(mem, mem + len);
            _free(mem);
            return filtered;
          };
          wam['brighten'] = function (pixelData, brightness=25) {
            const len = pixelData.length;
            const mem = _malloc(len);
            HEAPU8.set(pixelData, mem);
            _brighten(mem, len, brightness);
            const filtered = HEAPU8.subarray(mem, mem + len);
            _free(mem);
            return filtered;
          };
          wam['invert'] = function (pixelData) {
            const len = pixelData.length;
            const mem = _malloc(len);
            HEAPU8.set(pixelData, mem);
            _invert(mem, len);
            const filtered = HEAPU8.subarray(mem, mem + len);
            _free(mem);
            return filtered;
          };
          wam['noise'] = function (pixelData) {
            const len = pixelData.length;
            const mem = _malloc(len * Float32Array.BYTES_PER_ELEMENT);
            HEAPF32.set(pixelData, mem / Float32Array.BYTES_PER_ELEMENT);
            _noise(mem, len);
            const filtered = HEAPF32.subarray(mem / Float32Array.BYTES_PER_ELEMENT, mem / Float32Array.BYTES_PER_ELEMENT + len);
            _free(mem);
            return filtered;
          };
          wam['multiFilter'] = function (pixelData, width, filterType) {
            const len = pixelData.length;
            const mem = _malloc(len);
            HEAPU8.set(pixelData, mem);
            _multiFilter(mem, len, width, filterType);
            const filtered = HEAPU8.subarray(mem, mem + len);
            _free(mem);
            return filtered;
          };
          //bindLastArgs is defined and hoisted from below the module load
          wam['sunset'] = bindLastArgs(wam['multiFilter'], 4);
          wam['analogTV'] = bindLastArgs(wam['multiFilter'], 7);
          wam['emboss'] = bindLastArgs(wam['multiFilter'], 1);
          wam['sobelFilter'] = function (pixelData, width, height, invert=false) {
            const len = pixelData.length;
            const mem = _malloc(len);
            HEAPU8.set(pixelData, mem);
            _sobelFilter(mem, width, height, invert);
            const filtered = HEAPU8.subarray(mem, mem + len);
            _free(mem);
            return filtered;
          };
          wam['convFilter'] = function(pixelData, width, height, kernel, divisor, bias=0, count=1) {
            const arLen = pixelData.length;
            const memData = _malloc(arLen * Float32Array.BYTES_PER_ELEMENT);
            HEAPF32.set(pixelData, memData / Float32Array.BYTES_PER_ELEMENT);
            const kerWidth = kernel[0].length;
            const kerHeight = kernel.length;
            const kerLen = kerWidth * kerHeight;
            const flatKernel = kernel.reduce((acc, cur) => acc.concat(cur));
            const memKernel = _malloc(kerLen * Float32Array.BYTES_PER_ELEMENT);
            HEAPF32.set(flatKernel, memKernel / Float32Array.BYTES_PER_ELEMENT);                
            _convFilter(memData, width, height, memKernel, 3, 3, divisor, bias, count);
            const filtered = HEAPF32.subarray(memData / Float32Array.BYTES_PER_ELEMENT, memData / Float32Array.BYTES_PER_ELEMENT + arLen);
            _free(memData);
            _free(memKernel);
            return filtered;
          }
          resolve(wam);
        };
        document.body.appendChild(script);
      });
  });
}
//to bind arguments in the right order
function bindLastArgs (func, ...boundArgs){
  return function (...baseArgs) {
    return func(...baseArgs, ...boundArgs);
  }
}

// fallback extravaganza
function jsFallback() {
  const wam = {};
  wam['grayScale'] = js_grayScale;
  wam['brighten'] = js_brighten;
  wam['invert'] = js_invert;
  wam['noise'] = js_noise;
  wam['multiFilter'] = js_multiFilter;
  wam['sunset'] = bindLastArgs(js_multiFilter,4);
  wam['analogTV'] = bindLastArgs(js_multiFilter,7);
  wam['emboss'] = bindLastArgs(js_multiFilter,1);
  wam['sobelFilter'] = js_sobelFilter;
  wam['convFilter'] = js_convFilter;
  return wam;
}

function js_grayScale(data) {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i+1];
    let b = data[i+2];
    let a = data[i+3];
    // let brightness = (r*.21+g*.72+b*.07);

    data[i] = r;
    data[i+1] = r;
    data[i+2] = r;
    data[i+3] = a;
  }
  return data;
}
function js_brighten(data, brightness=25) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] + data[i] + brightness > 255 ? 255 : data[i] += brightness;
    data[i+1] + data[i+1] + brightness > 255 ? 255 : data[i+1] += brightness;
    data[i+2] + data[i+2] + brightness > 255 ? 255 : data[i+2] += brightness;
  }
  return data;
}
function js_invert(data) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i]; //r
    data[i+1] = 255 - data[i+1]; //g
    data[i+2] = 255 - data[i+2]; //b
  }
  return data;
}
function js_noise(data) {
  let random;
  for (let i = 0; i < data.length; i += 4) {
    random = (Math.random() - 0.5) * 70;
    data[i] = data[i] + random; //r
    data[i+1] = data[i+1] + random; //g
    data[i+2] = data[i+2] + random; //b
  }
  return data;
}
function js_multiFilter(data, width, filterType) {
  for (let i = 0; i < data.length; i += filterType) {
      if (i % 4 != 3) {
        data[i] = 127 + 2 * data[i] - data[i + 4] - data[i + width * 4];
      }
    }
  return data;
}
function js_sobelFilter(data, width, height, invert=false) {
  const out = [];
  let wid = width;
  let hei = height;
  var grayData = new Int32Array(wid * hei);

        function getPixel(x, y) {
            if (x < 0 || y < 0) return 0;
            if (x >= (wid) || y >= (hei)) return 0;
            return (grayData[((wid * y) + x)]);
        }
        //Grayscale
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var goffset = ((wid * y) + x) << 2; //multiply by 4
                var r = data[goffset];
                var g = data[goffset + 1];
                var b = data[goffset + 2];
                var avg = (r >> 2) + (g >> 1) + (b >> 3);
                grayData[((wid * y) + x)] = avg;
                var doffset = ((wid * y) + x) << 2;
                data[doffset] = avg;
                data[doffset + 1] = avg;
                data[doffset + 2] = avg;
                data[doffset + 3] = 255;
            }
        }
        //Sobel
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {

                var newX;
                var newY;
                if ((x >= width - 1) || (y >= height - 1)) {
                    newX = 0;
                    newY = 0;
                } else {
                    //sobel Filter use surrounding pixels and matrix multiply by sobel       
                    newX = (
                        (-1 * getPixel(x - 1, y - 1)) +
                        (getPixel(x + 1, y - 1)) +
                        (-1 * (getPixel(x - 1, y) << 1)) +
                        (getPixel(x + 1, y) << 1) +
                        (-1 * getPixel(x - 1, y + 1)) +
                        (getPixel(x + 1, y + 1))
                    );
                    newY = (
                        (-1 * getPixel(x - 1, y - 1)) +
                        (-1 * (getPixel(x, y - 1) << 1)) +
                        (-1 * getPixel(x + 1, y - 1)) +
                        (getPixel(x - 1, y + 1)) +
                        (getPixel(x, y + 1) << 1) +
                        (getPixel(x + 1, y + 1))
                    );
                    var mag = Math.floor(Math.sqrt((newX * newX) + (newY * newY)) >>> 0);
                    if (mag > 255) mag = 255;
                    if (invert) mag = 255 - mag;
                    data[((wid * y) + x) * 4] = mag;
                    data[((wid * y) + x) * 4 + 1] = mag;
                    data[((wid * y) + x) * 4 + 2] = mag;
                    data[((wid * y) + x) * 4 + 3] = 255;
                }
            }
        }
    return data; //sobelData;
}
function js_convFilter(data, width, height, kernel, divisor, bias=0, count=1) {
  const w = kernel[0].length;
  const h = kernel.length;
  const half = Math.floor(h / 2);
  for (let i = 0; i < count; i += 1) {
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const px = (y * width + x) * 4;  // pixel index
        let r = 0, g = 0, b = 0;

        for (let cy = 0; cy < h; ++cy) {
          for (let cx = 0; cx < w; ++cx) {
            const cpx = ((y + (cy - half)) * width + (x + (cx - half))) * 4;
            r += data[cpx + 0] * kernel[cy][cx];
            g += data[cpx + 1] * kernel[cy][cx];
            b += data[cpx + 2] * kernel[cy][cx];
          }
        }

        data[px + 0] = (1 / divisor) * r + bias;
        data[px + 1] = (1 / divisor) * g + bias;
        data[px + 2] = (1 / divisor) * b + bias;
      }
    }
  }
  return data;
}
