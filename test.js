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

function initVideo(fName, module, width=window.innerWidth, height=window.innerHeight) {
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

function loop() {
  animation = requestAnimationFrame(() => { loop(); });
  pixels = getPixels();
  // console.log('pixel data', pixels.data);
  // console.log('greyscale', m.greyScale(pixels.data));
  
  pixels.data.set(m.greyScale(pixels.data));
  // let newPixelData = [...Array(1000).keys()];
  // len = pixels.data.length;
  // console.log('before: ', pixels.data);
  // console.log(m);
  // mem = _malloc(len); // 4 = RGBA
  // HEAPU8.set(pixels.data, mem);
  // console.log('before', HEAPU8.subarray(mem, mem + len));
  // console.log('Module', Module);
  
  // m.manipArr(mem, len);
  // Module._greyScale(mem, len);
  // console.log('after', HEAPU8.subarray(mem, mem + len));
  // pixels.data.set(HEAPU8.subarray(mem, mem + len));
  // console.log('after: ', pixels.data);
  // _free(mem); // free memory
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
