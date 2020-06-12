'use strict'

// From: https://github.com/mikolalysenko/angle-normals
// Adapted for use with packed vertex and cell data
//
// The MIT License (MIT)
// 
// Copyright (c) 2013 Mikola Lysenko
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

module.exports = angleNormals

function weight(s, r, a) {
  return Math.atan2(r, (s - a))
}

function angleNormals(cells, positions) {
  var numVerts = positions.length
  var numCells = cells.length

  //Allocate normal array
  var normals = new Float32Array(numVerts);
  var tmp = [0.0, 0.0, 0.0];

  for(var cellPtr=0; cellPtr<numCells; cellPtr += 3) {
    var aIdx = cells[cellPtr] * 3;
    var bIdx = cells[cellPtr + 1] * 3;
    var cIdx = cells[cellPtr + 2] * 3;

    var abx = positions[bIdx] - positions[aIdx]
    var aby = positions[bIdx + 1] - positions[aIdx + 1]
    var abz = positions[bIdx + 2] - positions[aIdx + 2]
    var ab = Math.sqrt(abx * abx + aby * aby + abz * abz);

    var bcx = positions[bIdx] - positions[cIdx]
    var bcy = positions[bIdx + 1] - positions[cIdx + 1]
    var bcz = positions[bIdx + 2] - positions[cIdx + 2]
    var bc = Math.sqrt(bcx * bcx + bcy * bcy + bcz * bcz);

    var cax = positions[cIdx] - positions[aIdx]
    var cay = positions[cIdx + 1] - positions[aIdx + 1]
    var caz = positions[cIdx + 2] - positions[aIdx + 2]
    var ca = Math.sqrt(cax * cax + cay * cay + caz * caz);

    if(Math.min(ab, bc, ca) < 1e-6) {
      continue
    }

    var s = 0.5 * (ab + bc + ca)
    var r = Math.sqrt((s - ab)*(s - bc)*(s - ca)/s)

    var nx = aby * bcz - abz * bcy
    var ny = abz * bcx - abx * bcz
    var nz = abx * bcy - aby * bcx
    var nl = Math.sqrt(nx * nx + ny * ny + nz * nz);
    nx /= nl
    ny /= nl
    nz /= nl

    var w = Math.atan2(r, s - bc);
    normals[aIdx] += w * nx;
    normals[aIdx + 1] += w * ny;
    normals[aIdx + 2] += w * nz;

    w = Math.atan2(r, s - ca);
    normals[bIdx] += w * nx;
    normals[bIdx + 1] += w * ny;
    normals[bIdx + 2] += w * nz;

    w = Math.atan2(r, s - ab);
    normals[cIdx] += w * nx;
    normals[cIdx + 1] += w * ny;
    normals[cIdx + 2] += w * nz;
  }

  //Normalize all the normals
  for(var i=0; i<numVerts; i+=3) {
    var l = Math.sqrt(
      normals[i] * normals[i] +
      normals[i + 1] * normals[i + 1] +
      normals[i + 2] * normals[i + 2]
    );

    if(l < 1e-8) {
      normals[i] = 1
      normals[i + 1] = 0
      normals[i + 2] = 0
      continue
    }
    normals[i] /= l
    normals[i + 1] /= l
    normals[i + 2] /= l
  }

  return normals
}
