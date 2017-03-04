#include <math.h>
#include <stdio.h>

extern "C" {
  int doubler(int x) {
    return 2 * x;
  }

  int fib(int a) {
    if (a == 0 || a == 1) return a;
    return fib(a - 1) + fib(a - 2);
  }

  int manipArr(char* data, int len) {
    for (int i = 0; i < len; ++i) {
      printf("\nhello %d", data[i]);
      data[i] = data[i] * 3.0;
    }
    return 0;
  }
}