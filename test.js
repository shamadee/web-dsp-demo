let m;
loadWASM()
  .then(cMath => {
    m = cMath;
    // const len = 1000000;
    // let data = [...Array(len).keys()];
    // data = data.map(el => el * 1.1);
    // console.log('before: ', data);
    
    // const t4 = performance.now();
    // var mem = _malloc(len); // allocate shared memory
    // HEAPU8.set(data, mem); // write data into shared memory
    // cMath.manipArr(mem, len); // operate on data from webassembly
    // var result = HEAPU8.subarray(mem, mem + (len)); // read data from shared memory
    // _free(mem); // free memory
    // const t5 = performance.now();
    // console.log(`wasm took ${t5 - t4} ms to compute`);
    // console.log('result: ', result);

    // const t6 = performance.now();
    // for (let i = 0; i < len; i += 1) {
    //   data[i] = data[i] * 2;
    // }
    // const t7 = performance.now();
    // console.log(`js took ${t7 - t6} ms to compute`);
    // window.onload = initVideo('media/vid.mp4', m, 720, 486);
    window.onload = initVideo('media/vid.mp4', m);
  });

let canv, ctx, canv2, ctx2, ratio, winWidth, winHeight, vid, vHeight, c2Width, c2Height, animation, pixels;
let mem, len;
let t0, t1, t2, t3;
let stats, perf1, perf2, perfStr1, perfStr2, statsText, line1, line2;

function initVideo(fName, module, width=window.innerWidth-200, height=window.innerHeight-200) {
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
  stats = document.createElement('div');
  stats.id = 'stats';
  stats.textContent = 'status';
  document.body.appendChild(stats);
  
  statsGraph = document.createElement('canvas');
  statsGraph.id = 'statsCanvas';
  document.body.appendChild(statsGraph);
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
  smoothie.streamTo(document.getElementById('statsCanvas'), 1000);

  line1 = new TimeSeries();
  line2 = new TimeSeries();

  smoothie.addTimeSeries(line1,
    {
      strokeStyle: 'rgb(0, 255, 0)',
      fillStyle: 'rgba(0, 255, 0, 0.05)',
      lineWidth: 3,
    }
  );
  smoothie.addTimeSeries(line2,
    { strokeStyle: 'rgb(0, 0, 255)',
      fillStyle: 'rgba(0, 0, 255, 0.05)',
      lineWidth: 3,
    }
  );
}

function loop() {
  animation = requestAnimationFrame(() => { loop(); });
  pixels = getPixels();
  // console.log('pixel data', pixels.data);
  // console.log('greyscale', m.greyScale(pixels.data));
  t0 = performance.now();
  pixels.data.set(m.greyScale(pixels.data));
  t1 = performance.now();
  if (animation % 60 === 0) {
    perf1 = t1 - t0;
    perfStr1 = perf1.toString().slice(0, 4);
    t2 = performance.now();
    jsGreyScale(pixels.data);
    t3 = performance.now();
    perf2 = t3 - t2;
    perfStr2 = perf2.toString().slice(0, 5);
    statsText = `JS refresh rate: ${perfStr2} ms
    WASM refresh rate: ${perfStr1} ms`;
    document.getElementById("stats").textContent = statsText;

    line1.append(new Date().getTime(), 1000 / perf1);
    line2.append(new Date().getTime(), 1000 / perf2);

  }
  ctx2.putImageData(pixels, 0, 0);
  // ctx.drawImage(canv2, 0, 0, winWidth, vHeight);
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
      data[i+3] = 10;
    }
}
