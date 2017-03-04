loadWASM()
  .then(cMath => {
    console.log('FIB: ');
    const val = 20;
    const t0 = performance.now();
    cMath.fib(val);
    const t1 = performance.now();
    console.log(`wasm took ${t1 - t0}ms to compute`);

    function fibJS(a) {
      if (a == 0 || a == 1) return a;
      return fibJS(a - 1) + fibJS(a - 2);
    }
    const t2 = performance.now();
    fibJS(val);
    const t3 = performance.now();
    console.log(`js took ${t3 - t2}ms to compute`);

    console.log('\n\nArray manipulation');
    const len = 10000000;
    const data = [...Array(len).keys()];
    
    const t4 = performance.now();
    var mem = _malloc(len);
    HEAPU8.set(data, mem);
    cMath.manipArr(mem, len);
    var result = HEAPU8.subarray(mem, mem + len);
    const t5 = performance.now();
    console.log(`wasm took ${t5 - t4}ms to compute`);
    console.log('result: ', result);

    const t6 = performance.now();
    for (let i = 0; i < len; i += 1) {
      data[i] = data[i] * 2;
    }
    const t7 = performance.now();
    console.log(`js took ${t7 - t6}ms to compute`);
  });
