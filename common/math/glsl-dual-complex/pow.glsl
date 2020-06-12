vec4 cpow(vec4 a, float n) {
  float theta = atan(a.y, a.x);
  float r = hypot(a.xy);
  float tn = theta * n;
  float rn = pow(r, n);
  vec2 s = rn * vec2(sin(tn), cos(tn));
  float rn1 = pow(r, n - 1.0);
  float tn1 = theta * (n - 1.0);
  return vec4(s, cmul(a.zw, n * rn1 * vec2(sin(tn1), cos(tn1))));
}
