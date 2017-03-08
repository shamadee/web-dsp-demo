#!/bin/bash

# use path to emsdk folder, relative to this directory
BASEDIR="./../emsdk"
BASEDIRSHA="./../../../Documents/emsdk"
EMSDK_ENV=$(find "$BASEDIR" -type f -name "emsdk_env.sh")
source "$EMSDK_ENV"

# add exported C/C++ functions here
CPP_FUNCS="['_manipArr', '_fib', '_doubler', '_greyScale']"

echo "compiling C++ ..."
emcc -o cMath.js math.cpp -lm -O3 -s WASM=1 \
-s BINARYEN_IMPRECISE=1 -s "BINARYEN_METHOD='native-wasm,asmjs'" \
-s EXPORTED_FUNCTIONS="$CPP_FUNCS" \