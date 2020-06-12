module.exports = function floatRgbToHex (rgb) {
  return '#' + rgb.map(x => Math.floor(Math.max(0, Math.min(255, x * 255))).toString(16).padStart(2, '0')).join('')
}
