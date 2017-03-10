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

createStats();
addButtons();

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
  if (filter === 'Grayscale') pixels.data.set(m.greyScale(pixels.data));
  if (filter === 'Brighten') pixels.data.set(m.brighten(pixels.data));
  if (filter === 'Invert') pixels.data.set(m.invert(pixels.data));
  if (filter === 'Noise') pixels.data.set(m.noise(pixels.data));
  if (filter === 'Sunset') pixels.data.set(m.edgeManip(pixels.data, 4, cw)); //red cyan
  if (filter === 'Analog TV') pixels.data.set(m.edgeManip(pixels.data, 7, cw)); //dots
  if (filter === 'Emboss') pixels.data.set(m.edgeManip(pixels.data, 1, cw)); //emboss
  if (filter === 'Super Edge') pixels.data.set(m.convFilt(pixels.data, 720, 486));
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
  //pixels2.data.set(jsGreyScale(pixels2.data));
  if (filter === 'Grayscale') pixels2.data.set(jsGreyScale(pixels2.data));
  if (filter === 'Brighten') pixels2.data.set(jsBrighten(pixels2.data));
  if (filter === 'Invert') pixels2.data.set(jsInvert(pixels2.data));
  if (filter === 'Noise') pixels2.data.set(jsNoise(pixels2.data));
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

function addButtons (filtersArr) {
  let filters = ['Normal', 'Grayscale', 'Brighten', 'Invert', 'Noise', 'Sunset', 'Analog TV', 'Emboss', 'Super Edge']
  let buttonDiv = document.createElement('div');
  buttonDiv.id = 'buttons';
  document.body.appendChild(buttonDiv);
  for (let i = 0; i < filters.length; i++) {
    let button = document.createElement('button');
    button.innerText = filters[i];
    button.addEventListener('click', () => filter = filters[i]);
    buttonDiv.appendChild(button);
  }
}
