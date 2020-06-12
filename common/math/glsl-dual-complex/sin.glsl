vec4 csin(vec4 a) {
  vec4 asincos = csincos(a.xy);
  return vec4(asincos.xy, cmul(asincos.zw, a.zw));
}
