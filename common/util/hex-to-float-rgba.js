module.exports = function hexToFloatRgba(hex, alpha) {
  let match;
  alpha = alpha === undefined ? 1 : +alpha;
  if (
    (match = hex.match(/#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/))
  ) {
    return [
      parseInt(match[1], 16) / 255,
      parseInt(match[2], 16) / 255,
      parseInt(match[3], 16) / 255,
      alpha
    ];
  } else if ((match = hex.match(/#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/))) {
    return [
      parseInt(match[1], 16) / 15,
      parseInt(match[2], 16) / 15,
      parseInt(match[3], 16) / 15,
      alpha
    ];
  }
  return [0, 0, 0, alpha];
}
