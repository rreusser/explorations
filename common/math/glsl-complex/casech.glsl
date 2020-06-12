vec2 casech(vec2 z) {
  return cacosh(vec2(z.x, -z.y) / dot(z, z));
}
