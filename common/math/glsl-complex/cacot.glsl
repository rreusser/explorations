vec2 cacot (vec2 z) {
  return catan(vec2(z.x, -z.y) / dot(z, z));
}
