module.exports = {
  d: function cfromValuesD (a, b, c, d) {
    return new Float64Array([a, b, c, d]);
  },
  s: function cfromValuesS (a, b) {
    return new Float64Array([a, b]);
  }
}
