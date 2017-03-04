# load-wasm

This is a sample library using WebAssembly. To compile the C library download emscripten and run in terminal:
```
emcc math.c -Os -s WASM=1 -s SIDE_MODULE=1 -o math.wasm
```
Then open test.html in your browser (Chrome Canary or Firefox Developer Edition)

What is WebAssembly?
====================
+ Compact: minimize over-the-wire size i.e. download less code
+ Portable: runs the same on all browsers
+ Fast: faster to decode binary than parse JS
+ Safe: same security profile as JS, does not have access to random bits of memory

What do we do with it?
======================
* Compile to it -- it's a compiler target for the web
* Use it in Javascript -- efficiently load lots of code with predictable near-native performance. Build a library with it!
* It's a virtual CPU
* ASM.JS all grown up, a binary encoding with some optimizations to make it a better compiler target

```
asm.js         -> WebAssembly
(x+y)|0        -> i32.add // single op-code
f()|0          -> call
HEAP32[i>>2]|0 ~> i32.load
```

*In JS we simulate the heap with a typed array of bytes*
+ Allows for pointer arithmatic and is fast to compile
+ Typed array with an integer representing the pointer.
+ Pointers are byte indexed, arrays are int indexed, so we do some math with them (some kind of shift operation?)

Started out as Emscripten: C/C++ to JS compiler/toolchain
asm.js optimized Emscripten output

Why use asm.js?
===============
+ avoid plugins
+ bring existing applications to the Web
+ port high-perfomance C/C++ libraries for use by JS
+ predictable near-native perfromance (compared to JS)

Why use WebAssembly?
====================
+ further reduce load time
+ reduce over-the-wire size
+ reduce runtime memory consumption for code
+ closer to native code performance
+ shared memory (coming to JS too)

Start with some C code:
```
// demo.c
DLL_EXPORT
int add(int lhs, int rhs) {
  return lhs + rhs;
}
```
where functions we want to call from JS are exported:
```
// However DLL/DSO exports are defined in your compiler
#define DLL_EXPORT __attribute__ ((visibility ("default")))
```
then compile to .wasm:
```
$ clang -mwasm demo.c -o demo.wasm
```
*WebAssembly back-end in progress in upstream LLVM*

then view as WAST:
```
$ wasm2test demo.wasm | less
// outputs the following:
(module
  (func $add (param $lhs i32) (param $rhs i32) (result i32)
    (i32.add (get_local $lhs) (get_local $rhs))
  )
  (export "add" $add)
)
```
then load via JS API:
```
fetch('demo.wasm').then(response =>
  response.arrayBuffer()
).then(buffer => {
  let codeBytes = new Uint8Array(buffer);
  let instance = Wasm.instantiateModule(codeBytes);
  let three = instance.exports.add(1, 2); // three = 3
})
```

Emscripten
========== 
Maps common C/C++ interfaces to Web APIs, for example, using libc and SDL:
```
#include <SDL/SDL.h>
#include <stdio.h>

int main(int argc, char ** argv) {
  SDL_Init(SDL_INIT_VIDEO);
  SDL_Surace *s = SDL_SetVideoMode(200, 200, 32, SDL_HWSURFACE);
  SDL_Rect rect = { 50, 50, 100, 100 };
  SDL_FillRect(s, &rect, 0xffff0000);
  printf("Done!\n");
  return 0;
}
```

Compiled by Emscripten:
```
emcc -O2 test.c -o test.html
```

Should we compile JS to WASM?
=============================
*NO -- JS WILL RUN BEST AS JS BY THE JS ENGINE*

How will WebAssembly be used?
* Implicity through JS frameworks
 * Katz Ember talk
* WebAssembly libraries
 * ammo.js, sql.js, asmCrypto.js, cld, BA3
* Whole WebAssembly engine + JS frontend
 * MathStudio, Adobe Lightroom
* WebAssembly driving a big canvas with JS Chrome
 * Unity games in FaceBook
* WebAssembly driving one-big-canvas ports

Need a scripting language for your native app? Maybe pick JS

webassembly.github.io
Binaryen -- compiles C/C++ -> asm.js -> WebAssembly

What does emscripten support?
=============================
+ Common stuff, for the most part
+ SDL
+ OpenGL
+ OpenAL