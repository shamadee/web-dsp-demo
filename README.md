# load-wasm

This is a sample library using WebAssembly. To compile the C library download emscripten and run in terminal:

emcc -o cMath.js math.c -lm -O3 -s WASM=1 -s EXPORTED_FUNCTIONS="['_fib', '_doubler']" -s BINARYEN_IMPRECISE=1 -s "BINARYEN_METHOD='native-wasm,asmjs'"

Then open test.html in your browser (Chrome Canary or Firefox Developer Edition)


TODOS:

  - mention alternatives to promise loading mechanism
  - explain naming convention