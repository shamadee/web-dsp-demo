int doubler(int x) {
  return 2 * x;
}

int fib(int a) {
  if (a == 0 || a == 1) return a;
  return fib(a - 1) + fib(a - 2);
}