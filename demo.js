let m;
loadWASM()
  .then(cMath => {
    m = cMath;
    window.onload = initVideo('media/vid.mp4', m);
  });

let canv, ctx, canv2, ctx2, ratio, winWidth, winHeight, vid, vHeight, c2Width, c2Height, animation, pixels;
let mem, len;
let t0, t1, t2, t3;
let stats, perf1, perf2, perfStr1, perfStr2, wasmStats, jsStats, line1, line2, jsData;
let arrLen = 350000;

function initVideo(fName, module, width=window.innerWidth-100, height=window.innerHeight-200) {
  winWidth = width;
  winHeight = height;

  vid = document.createElement('video');
  vid.src = fName;
  vid.autoplay = true;
  vid.loop = true;
  

  vid.addEventListener("loadedmetadata", vidLoaded, false);
}

function vidLoaded() {
  console.log('video height', vid.videoHeight);
  console.log('video width', vid.videoWidth);
  ratio = vid.videoHeight / vid.videoWidth;
  console.log(ratio);
  vHeight = winWidth * ratio;
  vid.width = winWidth;
  vid.height = winHeight;

  createStats();
  createCanvas();
}

function createCanvas() {
  canv = document.createElement('canvas');
  ctx = canv.getContext('2d');
  canv.width = winWidth;
  canv.height = winHeight;
  canv.style.position = 'absolute';
  canv.style.top = 0;
  canv.style.left = 0;
  canv.style.zIndex = 0;

  document.body.appendChild(canv);

  canv2 = document.createElement('canvas');
	ctx2 = canv2.getContext('2d');
	// canv2Width = Math.floor(winWidth / 4);
  canv2Width = 720;

	// canv2Height = (winWidth / 4) * ratio;
  canv2Height = 486;

	canv2.width = canv2Width;
	canv2.height = canv2Height;

  loop();
}

function createStats() {
  
  // create container div
  stats = document.createElement('div');
  stats.id = 'stats';
  stats.textContent = 'performance stats ...';
  document.body.appendChild(stats);
  
  // create canvas for smoothie.js 
  statsGraph = document.createElement('canvas');
  statsGraph.id = 'statsCanvas';
  document.body.appendChild(statsGraph);
  
  // define smoothie grid layout and colors
  let smoothie = new SmoothieChart({
    maxValueScale: 1.1,
    minValueScale: 0.5,
    grid: {
      strokeStyle: 'rgb(60, 60, 60)',
      fillStyle: 'rgb(30, 30, 30)',
      lineWidth: 1,
      millisPerLine: 250,
      verticalSections: 5,
    },
    labels: {
      fillStyle: 'rgb(255, 255, 255)',
      fontSize: 14,
    },
  });
  // send smoothie data to canvas
  smoothie.streamTo(document.getElementById('statsCanvas'), 1000);
  
  // declare smoothie timeseries 
  line1 = new TimeSeries();
  line2 = new TimeSeries();
  
  // define graph lines and colors
  smoothie.addTimeSeries(line1,
    {
      strokeStyle: 'rgb(0, 255, 0)',
      fillStyle: 'rgba(0, 255, 0, 0.075)',
      lineWidth: 3,
    }
  );
  smoothie.addTimeSeries(line2,
    { strokeStyle: 'rgb(0, 0, 255)',
      fillStyle: 'rgba(0, 0, 255, 0.075)',
      lineWidth: 3,
    }
  );
}

function loop() {
  animation = requestAnimationFrame(() => { loop(); });
  pixels = getPixels();
  t0 = performance.now();
  //pixels.data.set(m.convFilt(pixels.data, 720, 486));
  //pixels.data.set(m.greyScale(pixels.data));
  //pixels.data.set(m.brighten(pixels.data));
  //pixels.data.set(m.invert(pixels.data));
  //pixels.data.set(m.noise(pixels.data));
  pixels.data.set(m.edgeManip(pixels.data, 4, canv2Width)); //red cyan
  //pixels.data.set(m.edgeManip(pixels.data, 7, canv2Width)); //dots
  //pixels.data.set(m.edgeManip(pixels.data, 1, canv2Width)); //emboss
  t1 = performance.now();
  t2 = performance.now();
  // jsData = convFilter(pixels.data);
  // pixels.data.set(jsData);
  t3 = performance.now();
  
  if (animation % 15 === 0) {
    perf1 = t1 - t0;
    perfStr1 = perf1.toString().slice(0, 4);
    perf2 = t3 - t2;
    perfStr2 = perf2.toString().slice(0, 5);
    jsStats = `JS refresh rate: ${perfStr2} ms`;
    wasmStats = `WASM refresh rate: ${perfStr1} ms`;
    document.getElementById("stats").textContent = jsStats + wasmStats;

    line1.append(new Date().getTime(), 1000 / perf1);
    // line2.append(new Date().getTime(), 1000 / perf2);
  }

  ctx2.putImageData(pixels, 0, 0);
  ctx.drawImage(canv2, 0, 0, 720, 486);
  draw();
}

function draw() {
  ctx.drawImage(canv2, 0, 0, 720, 486);
}

function getPixels() {
  ctx2.drawImage(vid, 0, 0, canv2Width, canv2Height);
  return ctx2.getImageData(0, 0, canv2Width, canv2Height);
}


//Javascript Filters

function jsGreyScale(data) {
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i+1];
      let b = data[i+2];
      let a = data[i+3];
      let brightness = (r*.21+g*.72+b*.07);

      data[i] = r;
      data[i+1] = r;
      data[i+2] = r;
      data[i+3] = a;
    }
    return data;
}

function convFilter(data, height=486, width=720) {
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
                    data[((wid * y) + x) * 4] = mag;
                    data[((wid * y) + x) * 4 + 1] = mag;
                    data[((wid * y) + x) * 4 + 2] = mag;
                    data[((wid * y) + x) * 4 + 3] = 255;
                }
            }
        }
    return data; //sobelData;
}

/* stuff that's not filters 

function callManipArr() {
  const arr = [...Array(arrLen).keys()];
  mem = _malloc(arr.length);
  let tA = performance.now();
  HEAPU8.set(arr, mem);
  m.manipArr(mem, arr.length);
  let tB = performance.now();
  _free(mem);
  console.log('wasm took ', tB - tA, ' ms');
}

function jsManipArr() {
  const arr = [...Array(arrLen).keys()];
  let tA = performance.now();
  jsArr(arr);
  let tB = performance.now();
  console.log('js took ', tB - tA, ' ms');
}

function jsArr(arr) {
  for (let i = 0; i < arr.length; i++) {
    // arr[i] = Math.sqrt(arr[i]);
    arr[i] = arr[i] * arr[i];
  }
}

function singleManip() {
  const arr = [...Array(arrLen).keys()];
  let tA = performance.now();
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    arr[i] = m.manipSingle(arr[i]);
  }
  let tB = performance.now();
  console.log('single took ', tB - tA, ' ms');
}
*/
