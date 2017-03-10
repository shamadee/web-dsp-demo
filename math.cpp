#include <math.h>
#include <stdlib.h>
// #include <stdio.h>

extern "C" {
  int doubler(int x) {
    return 2 * x;
  }

  int fib(int a) {
    if (a == 0 || a == 1) return a;
    return fib(a - 1) + fib(a - 2);
  }

  void manipArr(unsigned char* data, int len) {
    for (int i = 0; i < len; i++) {
      data[i] = data[i] * data[i];
    }
  }

  float manipSingle(int a) {
    return a * a;
  }

//start filters below

  void greyScale(unsigned char* data, int len) {
    for (int i = 0; i < len; i += 4) {
      int r = data[i];
      int g = data[i+1];
      int b = data[i+2];
      int a = data[i+3];
      int brightness = (r*.21+g*.72+b*.07);
      data[i] = r;
      data[i+1] = r;
      data[i+2] = r;
      data[i+3] = a;
    }
  }
  
  void brighten(unsigned char* data, int len) {
    int brightness = 25;
    for (int i = 0; i < len; i += 4) {
      data[i] + data[i] + brightness > 255 ? 255 : data[i] += brightness;
      data[i+1] + data[i+1] + brightness > 255 ? 255 : data[i+1] += brightness;
      data[i+2] + data[i+2] + brightness > 255 ? 255 : data[i+2] += brightness;
    }
  }

  void invert(unsigned char* data, int len) {
    for (int i = 0; i < len; i += 4) {
      data[i] = 255 - data[i]; //r
      data[i+1] = 255 - data[i+1]; //g
      data[i+2] = 255 - data[i+2]; //b
    }
  }

  void noise (unsigned char* data, int len) {
    int random; 
    for (int i = 0; i < len; i += 4) {
      random = (rand() % 70) - 35;
      data[i] = data[i] + random; //r
      data[i+1] = data[i+1] + random; //g
      data[i+2] = data[i+2] + random; //b
    }
  }
  
  const int WIDTH = 720;
  const int HEIGHT = 486;
  int grayData[WIDTH * HEIGHT];

  int getPixel(int x, int y) {
    if (x < 0 || y < 0) return 0;
    if (x >= (WIDTH) || y >= (HEIGHT)) return 0;
    return (grayData[((WIDTH * y) + x)]);
  }

  void convFilter(unsigned char* data, int width, int height) {

      for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            int goffset = ((WIDTH * y) + x) << 2; //multiply by 4
            int r = data[goffset];
            int g = data[goffset + 1];
            int b = data[goffset + 2];

            int avg = (r >> 2) + (g >> 1) + (b >> 3);
            grayData[((WIDTH * y) + x)] = avg;

            int doffset = ((WIDTH * y) + x) << 2;
            data[doffset] = avg;
            data[doffset + 1] = avg;
            data[doffset + 2] = avg;
            data[doffset + 3] = 255;

        }
    }

    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            int newX;
            int newY;
            if ((x <= 0 || x >= width - 1) || (y <= 0 || y >= height - 1)) {
                newX = 0;
                newY = 0;
            } else {
                newX = (
                    (-1 * getPixel(x - 1, y - 1)) +
                    (getPixel(x + 1, y - 1)) +
                    (-1 * (getPixel(x - 1, y) << 1)) +
                    (getPixel(x + 1, y) << 1) +
                    (-1 * getPixel(x - 1, y + 1)) +
                    (getPixel(x + 1, y + 1))
                );
                newY = (
                    (-1 * getPixel(x - 1, y - 1)) +
                    (-1 * (getPixel(x, y - 1) << 1)) +
                    (-1 * getPixel(x + 1, y - 1)) +
                    (getPixel(x - 1, y + 1)) +
                    (getPixel(x, y + 1) << 1) +
                    (getPixel(x + 1, y + 1))
                );
            }
            int mag = sqrt((newX * newX) + (newY * newY));
            if (mag > 255) mag = 255;
            int offset = ((WIDTH * y) + x) << 2; //multiply by 4
            data[offset] = 255 - mag;
            data[offset + 1] = 255 - mag;
            data[offset + 2] = 255 - mag;
            data[offset + 3] = 255;
        }
      }
  }

  

}