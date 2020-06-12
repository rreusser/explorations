module.exports = function hexRgbToFloat (hex) {
  let match
  if ((match = hex.match(/#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/))) {
    return [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255]
  } else if ((match = hex.match(/#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/))) {
    return [parseInt(match[1], 16) / 15, parseInt(match[2], 16) / 15, parseInt(match[3], 16) / 15]
  }
  return [0, 0, 0]
}
