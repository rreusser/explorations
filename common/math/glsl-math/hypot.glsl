#ifndef GLSL_HYPOT
#define GLSL_HYPOT
float hypot (vec2 z) {
  float x = abs(z.x);
  float y = abs(z.y);
  float t = min(x, y);
  x = max(x, y);
  t = t / x;
  return x * sqrt(1.0 + t * t);

  // This conditional seems unnecessary on the non-cpu version
  //return (z.x == 0.0 && z.y == 0.0) ? 0.0 : x * sqrt(1.0 + t * t);
}
#endif
