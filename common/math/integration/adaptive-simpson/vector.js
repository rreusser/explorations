function createAdaptiveVectorIntegrator (n, outputs) {
  var i = cb => new Array(n).fill(0).map((d, ii) => cb(ii));
  var fa = i(i => `fa${i}`).join(', ')
  var fm = i(i => `fm${i}`).join(', ')
  var fb = i(i => `fb${i}`).join(', ')
  var fml = i(i => `fml${i}`).join(', ')
  var fmr = i(i => `fmr${i}`).join(', ')
  var S = i(i => `S${i}`).join(', ')
  var left = i(i => `left${i}`).join(', ')
  var right = i(i => `right${i}`).join(', ')
  
  var str = `
var tmp = new Array(${n})
var tmp2 = new Array(40).fill(0).map(() => new Array(${n}))
function adsimp (out, f, a, b, ${fa}, ${fm}, ${fb}, ${S}, epsilon, maxdepth) {
  var i, dx
  var h = (b - a) * 0.5
  var m = (a + b) * 0.5
  var h6 = h / 6
  ${outputs ? 'f(tmp, ' : 'tmp = f('}(a + m) * 0.5)
${i(i => `  var fml${i} = tmp[${i}]`).join('\n')}
${i(i => `  var left${i} = h6 * (fa${i} + 4 * fml${i} + fm${i})`).join('\n')}
  ${outputs ? 'f(tmp, ' : 'tmp = f('}(m + b) * 0.5)
${i(i => `  var fmr${i} = tmp[${i}]`).join('\n')}
${i(i => `  var right${i} = h6 * (fm${i} + 4 * fmr${i} + fb${i})`).join('\n')}
${i(i => `  var dx${i} = left${i} + right${i} - S${i}`).join('\n')}
  var l2err = Math.sqrt(${i(i => `dx${i} * dx${i}`).join('+')})
  if (maxdepth <= 0 || l2err <= 15 * epsilon) {
${i(i => `  out[${i}] = left${i} + right${i} + dx${i} / 15;`).join('\n')}
  } else {
    m = (a + b) * 0.5
    epsilon *= 0.5
    maxdepth--
    var dst = tmp2[maxdepth]
    adsimp(dst, f, a, m, ${fa}, ${fml}, ${fm}, ${left}, epsilon, maxdepth)
${i(i => `    out[${i}] = dst[${i}]`).join('\n')}
    adsimp(dst, f, m, b, ${fm}, ${fmr}, ${fb}, ${right}, epsilon, maxdepth)
${i(i => `    out[${i}] += dst[${i}]`).join('\n')}
  }
  return out
}
        
return function (result, f, fa, a, b, tolerance, maxdepth) {
  var i, n
  /*${outputs ? 'f(tmp, ' : 'tmp = f('}a);*/
${i(i => `  var fa${i} = fa[${i}]`).join('\n')}
  ${outputs ? 'f(tmp, ' : 'tmp = f('}0.5 * (a + b));
${i(i => `  var fm${i} = tmp[${i}]`).join('\n')}
  ${outputs ? 'f(tmp, ' : 'tmp = f('}b);
${i(i => `  var fb${i} = tmp[${i}]`).join('\n')}
  var h6 = (b - a) / 6
${i(i => `  var S${i} = (fa${i} + 4 * fm${i} + fb${i}) * h6`).join('\n')}
   return adsimp(result, f, a, b, ${fa}, ${fm}, ${fb}, ${S}, tolerance, maxdepth);
}`
  // Uncomment to view the generated code
  // console.log(str)
  return new Function(str)();
}
  
var integratorCache = new Map();

module.exports = function integrateVectorFunctionAdaptiveSimpson (result, f, a, b, tolerance, maxDepth, n) {
  // Shift arguments if result not provided
  if (typeof result === 'function') {
    n = maxDepth; maxDepth = tolerance; tolerance = b; b = a; a = f; f = result
    result = []
  }
  // Perform one function evaluation up front to check the size of the output
  // if not explicitly specified. Either way, we do still make use of it.
  var outputs = f.length === 2
  var fa
  if (outputs) {
    fa = []
    f(fa, a)
  } else {
    fa = f(a)
  }
  if (n === undefined) n = fa.length
  var key = n.toString() + (outputs ? 'o' : '');
  var cachedIntegrator = integratorCache.get(key)
  if (!cachedIntegrator) {
    cachedIntegrator = createAdaptiveVectorIntegrator(n, outputs)
    integratorCache.set(n, cachedIntegrator)
  }
  
  if (tolerance === undefined) tolerance = 1e-11
  if (maxDepth === undefined) maxDepth = 8
  
  // Adjust the tolerance so that, all other things equal, it corresponds
  // to the scalar version. That is, integrating the same function twice
  // as a vector will behave the same as integrating it as a scalar.
  tolerance /= Math.sqrt(n)
  
  return cachedIntegrator(result, f, fa, a, b, tolerance, maxDepth)
}
