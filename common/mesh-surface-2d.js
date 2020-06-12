'use strict';

function assert (condition, message) {
  if (!condition) throw new Error(message);
}

var DEFAULT_RESOLUTION = 30;
var tmp1 = [0.0, 0.0, 0.0];
var tmp2 = [0.0, 0.0, 0.0];
var tmp3 = [0.0, 0.0, 0.0];

module.exports = function (meshData, surfaceFn, opts) {
  var i, j, u, v, index, nbUFaces, nbVFaces;

  opts = opts || {};

  var res = opts.resolution || DEFAULT_RESOLUTION;
  var nbUFaces = Array.isArray(opts.resolution) ? opts.resolution[0] : res;
  var nbVFaces = Array.isArray(opts.resolution) ? opts.resolution[1] : res;

  var uDomain = opts.uDomain === undefined ? [0, 1] : opts.uDomain;
  var vDomain = opts.vDomain === undefined ? [0, 1] : opts.vDomain;

  meshData = meshData || {};

  var nbBoundaryAdjustedUFaces = nbUFaces;
  var nbBoundaryAdjustedVFaces = nbVFaces;
  if (!opts.uClosed) nbBoundaryAdjustedUFaces += 1;
  if (!opts.vClosed) nbBoundaryAdjustedVFaces += 1;

  var nbPositions = nbBoundaryAdjustedUFaces * nbBoundaryAdjustedVFaces;
  var positionDataLength = nbPositions * 2;
  var positions = meshData.positions = meshData.positions || new Float32Array(positionDataLength);
  assert(positions.length, positionDataLength, 'Incorrect number of positions in pre-allocated array');

  var nbFaces = nbUFaces * nbVFaces * 2;
  var cellDataLength = nbFaces * 3;
  var cells = meshData.cells = meshData.cells || new Int16Array(cellDataLength);
  assert(cells.length, cellDataLength, 'Incorrect number of cells in pre-allocated array');

  if (opts.attributes) {
    meshData.attributes = {};
    var attrSize = {};
    var attributeKeys = Object.keys(opts.attributes);

    for (i = 0; i < attributeKeys.length; i++) {
      var key = attributeKeys[i];
      var attrFn = opts.attributes[key];
      var test = [];
      attrFn(test, uDomain[0], vDomain[0]);
      attrSize[key] = test.length;

      var attrDataLength = nbPositions * attrSize[key];
      meshData.attributes[key] = meshData.attributes[key] || new Float32Array(attrDataLength);
      assert(meshData.attributes[key].length, attrDataLength, 'Incorrect attr size in pre-allocated array for attr ' + key);
    }
  }

  for (i = 0; i < nbBoundaryAdjustedUFaces; i++) {
    u = uDomain[0] + (uDomain[1] - uDomain[0]) * i / nbUFaces;
    for (j = 0; j < nbBoundaryAdjustedVFaces; j++) {
      v = vDomain[0] + (vDomain[1] - vDomain[0]) * j / nbVFaces;

      index = 2 * (i + nbBoundaryAdjustedUFaces * j);

      surfaceFn(tmp1, u, v);

      positions[index + 0] = tmp1[0];
      positions[index + 1] = tmp1[1];

      if (attributeKeys) {
        for (var k = 0; k < attributeKeys.length; k++) {
          var key = attributeKeys[k];
          var attrFn = opts.attributes[key];
          attrFn(tmp1, u, v);
          var attrIndex = (i + nbBoundaryAdjustedUFaces * j) * attrSize[key];
          var attrData = meshData.attributes[key];
          for (var l = 0; l < attrSize[key]; l++) {
            attrData[attrIndex + l] = tmp1[l];
          }
        }
      }

    }
  }

  var faceIndex = 0;
  for (i = 0; i < nbUFaces; i++) {
    var iPlusOne = i + 1;
    if (opts.uClosed) iPlusOne = iPlusOne % nbUFaces;
    for (j = 0; j < nbVFaces; j++) {
      var jPlusOne = j + 1;
      if (opts.vClosed) jPlusOne = jPlusOne % nbVFaces;

			cells[faceIndex++] = i + nbBoundaryAdjustedUFaces * j;
			cells[faceIndex++] = iPlusOne + nbBoundaryAdjustedUFaces * j;
			cells[faceIndex++] = iPlusOne + nbBoundaryAdjustedUFaces * jPlusOne;

			cells[faceIndex++] = i + nbBoundaryAdjustedUFaces * j;
			cells[faceIndex++] = iPlusOne + nbBoundaryAdjustedUFaces * jPlusOne;
			cells[faceIndex++] = i + nbBoundaryAdjustedUFaces * jPlusOne;
    }
  }

  return meshData;
};
