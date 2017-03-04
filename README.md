# load-wasm

This is a sample library using WebAssembly. To compile the C library download emscripten and run in terminal:

emcc math.c -Os -s WASM=1 -s SIDE_MODULE=1 -o math.wasm

Then open test.html in your browser (Chrome Canary or Firefox Developer Edition)