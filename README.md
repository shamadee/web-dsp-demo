
## A client-side DSP library utilizing the power of WebAssembly (.wasm)

### Dropping in WebAssembly
Use loadWASM() to fetch the WebAssembly module as a promise object.
If WebAssembly is not supported in the browser, use jsFallback() in the catch block
```javascript
var m = {};
loadWasm().then(module => {
  m = module;
}).catch((err => {
  jsFallback();
}).then(() => {
  //things to execute on page load only after module is loaded
})
```

Now you can call a WebAssembly method with plain JS:
```javascript
pixels = context.getImageData(0,0,width,height);
button.addEventListener('click', () => {
  m.invert(pixels);
})
