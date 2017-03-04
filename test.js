loadWASM()
  .then(cMath => {
    let val = 10;
    t0 = performance.now();
    cMath.fib(val);
    t1 = performance.now();
    console.log(`wasm took ${t1 - t0}ms to compute`);

    function fibJS(a) {
      if (a == 0 || a == 1) return a;
      return fibJS(a - 1) + fibJS(a - 2);
    }
    t2 = performance.now();
    fibJS(val);
    t3 = performance.now();
    console.log(`js took ${t3 - t2}ms to compute`);
    
    // t4 = performance.now();
    // _fib(val);
    // t5 = performance.now();
    // console.log(`asm took ${t5 - t4}ms to compute`);
  });
