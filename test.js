loadWebAssembly().then(cMath => {
  const num = 50;
  const t0 = performance.now();
  cMath.fib(num);
  const t1 = performance.now();
  console.log(`WASM took ${t1 - t0} seconds`);
  const t2 = performance.now();
  fib(num);
  const t3 = performance.now();
  console.log(`JS took ${t3 - t2} seconds`);
});

function fib(num) {
  if (num === 0 || num === 1) return num;
  return fib(num - 1) + fib(num - 2);
}
