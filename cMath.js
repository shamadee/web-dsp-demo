// Build math.wasm
// emcc math.c -Os -s WASM=1 -s SIDE_MODULE=1 -o math.wasm

function loadWebAssembly() {
  const cMath = {};
  return new Promise((resolve, reject) => {
    loadWebAssemblyInstance('math.wasm')
      .then(instance => {
        var exports = instance.exports; // the exports of that instance
        cMath['doubler'] = exports._doubler; // the "doubler" function (note "_" prefix)
        cMath['fib'] = exports._fib;
        resolve(cMath);
      });
  });
}

function loadWebAssemblyInstance(filename, imports) {
  if (!('WebAssembly' in window)) {
  alert('you need a browser with wasm support enabled :(');
  }
  // Fetch the file and compile it
  return fetch(filename)
    .then(response => response.arrayBuffer())
    .then(buffer => WebAssembly.compile(buffer))
    .then(module => {
      // Create the imports for the module, including the
      // standard dynamic library imports
      imports = imports || {};
      imports.env = imports.env || {};
      imports.env.memoryBase = imports.env.memoryBase || 0;
      imports.env.tableBase = imports.env.tableBase || 0;
      if (!imports.env.memory) {
        imports.env.memory = new WebAssembly.Memory({ initial: 256 });
      }
      if (!imports.env.table) {
        imports.env.table = new WebAssembly.Table({ initial: 0, element: 'anyfunc' });
      }
      // Create the instance.
      return new WebAssembly.Instance(module, imports);
    });
}