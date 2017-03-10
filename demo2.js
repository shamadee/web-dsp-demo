let m;
loadWASM()
  .then(cMath => {
    m = cMath;
    //window.onload = initVideo('media/vid.mp4', m);
});

let filter = 'Normal', animation, animation2, perf1, perf2, jsStats, wasmStats;
//wasm video
var vid = document.getElementById('v');
var canvas = document.getElementById('c');
var context = canvas.getContext('2d');
var cw, ch;
vid.addEventListener("loadedmetadata", function() {
  canvas.setAttribute('height', vid.videoHeight);
  canvas.setAttribute('width', vid.videoWidth);
  cw = canvas.clientWidth; //usually same as canvas.height
  ch = canvas.clientHeight;
});

//javascript video
var vid2 = document.getElementById('v2');
var canvas2 = document.getElementById('c2');
var context2 = canvas2.getContext('2d');
var cw2, ch2;
vid2.addEventListener("loadedmetadata", function() {
  canvas2.setAttribute('height', vid2.videoHeight);
  canvas2.setAttribute('width', vid2.videoWidth);
  cw2 = canvas.clientWidth; //usually same as canvas.height
  ch2 = canvas.clientHeight;
});

// vid.addEventListener("play", draw);
setTimeout(draw, 1000); //hacky way to wait for module to load
function draw() {
  context.drawImage(vid, 0, 0);
  let pixels = context.getImageData(0, 0, vid.videoWidth, vid.videoHeight);
  let t0 = performance.now();
  pixels.data.set(m.greyScale(pixels.data));
  let t1 = performance.now();
  context.putImageData(pixels, 0, 0);
  animation = requestAnimationFrame(draw); 
  //adding lines to stats stream
  if (animation % 15 === 0) {
    perf1 = t1 - t0;
    perfStr1 = perf1.toString().slice(0, 4);
    wasmStats = `WASM computation time: ${perfStr1} ms`;
    document.getElementById("stats").textContent = wasmStats;
    line1.append(new Date().getTime(), 1000 / perf1);
  }
}

//for javascript example
setTimeout(draw2, 1000); //hacky way to wait for module to load
function draw2() {
  context2.drawImage(vid2, 0, 0);
  let pixels2 = context2.getImageData(0, 0, vid2.videoWidth, vid2.videoHeight);
  let t2 = performance.now();
  pixels2.data.set(jsGreyScale(pixels2.data));
  let t3 = performance.now();
  context2.putImageData(pixels2, 0, 0);
  //adding lines to stats stream
  animation2 = requestAnimationFrame(draw2);  
    if (animation % 15 === 0) {
    perf2 = t3 - t2;
    perfStr2 = perf2.toString().slice(0, 5);
    jsStats = `JS computation time: ${perfStr2} ms`;
    document.getElementById("stats").textContent += '  ' + jsStats;
    line2.append(new Date().getTime(), 1000 / perf2);
  }
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
      data[i+3] = a;
    }
    return data;
}

function createStats() {
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
createStats();