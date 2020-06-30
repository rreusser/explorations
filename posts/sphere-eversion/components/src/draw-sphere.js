const meshSurface = require('../../../../common/mesh/mesh-surface-2d');

module.exports = function (regl, res) {
  const fudge = 1.0 - 1e-4;
  const mesh = meshSurface({}, (out, u, v) => {
    out[0] = u;
    out[1] = v;
    return out;
  }, {
    resolution: [res, res],
    uDomain: [
      -Math.PI * 0.5 * fudge,
      Math.PI * 0.5 * fudge
    ],
    vDomain: [
      -Math.PI * fudge,
      Math.PI * fudge
    ],
  });

  const positionsBuffer = regl.buffer(mesh.positions);
  const elementsBuffer = regl.elements(mesh.cells);

  return regl({
    vert: `
      precision highp float;
      attribute vec2 uv;
      uniform mat4 projection, view;
      varying vec3 vPosition, vNormal;
      varying vec2 vUV;
      uniform float t, q, xi, eta, alpha, lambda, beta, n, omega, scale, translation;
      uniform float stereo, rotation, Qinv, posClip, negClip, shittyEversion;
      #define PI 3.141592653589

      float safepow(float x, float n) {
        return pow(abs(x), n);
      }
      float sqr(float x) {
        return x * x;
      }

      float intpow(float x, float n) {
        return pow(abs(x), n) * (mod(n, 2.0) == 0.0 ? 1.0 : sign(x));
      }

      vec3 f(vec2 uv) {
        uv.x = min(PI * 0.5 - 1e-5, uv.x);
        uv.x = max(-PI * 0.5 + 1e-5, uv.x);
        float theta = uv.x;
        float phi = uv.y;
        float cphi = cos(phi);
        float sphi = sin(phi);
        float sth = sin(theta);
        float cosnth = intpow(cos(theta), n);
        float h = omega * sth / cosnth;

        float p = 1.0 - abs(q * t);
        float kappa = mix(0.0, 0.5 * (n - 1.0) / n, stereo);

        float x, y, z;
        bool eq4 = abs(t) < Qinv - 1e-5;
        if (eq4) {
          x = t * cphi + p * sin((n - 1.0) * phi) - h * sphi;
          y = t * sphi + p * cos((n - 1.0) * phi) + h * cphi;
          z = h * sin(n * phi) - (t / n) * cos(n * phi) - q * t * h;
        } else {
          x = (t * (1.0 - lambda + lambda * cosnth) * cphi - lambda * omega * sth * sphi) / cosnth;
          y = (t * (1.0 - lambda + lambda * cosnth) * sphi + lambda * omega * sth * cphi) / cosnth;
          z = lambda * (omega * sth * (sin(n * phi) - q * t) / cosnth - (t / n) * cos(n * phi)) - (1.0 - lambda) * pow(eta, 1.0 + kappa) * t * pow(abs(t), 2.0 * kappa) * sth / sqr(cosnth);
        }
        
        float xiex2y2 = xi + eta * (x * x + y * y);
        float xp = x / safepow(xiex2y2, kappa);
        float yp = y / safepow(xiex2y2, kappa);
        float zp = z / mix(1.0, xiex2y2, stereo);

        float gamma = mix(1.0, 2.0 * sqrt(alpha * beta), stereo);
        float bxpyp = beta * (xp * xp + yp * yp);
        float egz = exp(gamma * zp);
        float xpp = xp * mix(1.0, egz / (alpha + bxpyp), stereo);
        float ypp = yp * mix(1.0, egz / (alpha + bxpyp), stereo);
        float zpp = mix(zp, (alpha - bxpyp) / (alpha + bxpyp) * egz / gamma - (alpha - beta) / (alpha + beta) / gamma, stereo);

        vec3 pos = vec3(xpp, ypp, zpp).xzy * vec3(1, 1, -1) * scale + vec3(0.0, translation, 0.0);

        float cr = cos(rotation);
        float sr = sin(rotation);
        mat2 R = mat2(cr, sr, -sr, cr);
        pos.xz = R * pos.xz;

        pos.y = pos.y * mix(1.0, -1.0, 1.2 * shittyEversion * abs(uv.x));
        return pos;
      }

      void main () {
        //vUV = uv * vec2(uv.x > 0.0 ? 0.707 * pow(posClip, n * 0.25) : 0.707 * pow(negClip, n * 0.25), 1.0);
        vUV = uv * vec2(uv.x > 0.0 ? posClip : negClip, 1.0);
        vPosition = f(vUV);

        float dx = 2e-2;
        vec3 pu = f(vUV + vec2(dx, 0));
        vec3 pv = f(vUV + vec2(0, dx));
        vec3 dpdu = pu - vPosition;
        vec3 dpdv = pv - vPosition;
        vNormal = normalize(cross(dpdu, dpdv));

        //vPosition -= f(vec2((PI * 0.5 - 1e-4) * (t > 0.0 ? -1.0 : 1.0), 0.0)) + vec3(0, 1.5, 0);

        gl_Position = projection * view * vec4(vPosition, 1);
      }
    `,
    frag: `
      #extension GL_OES_standard_derivatives : enable
      precision highp float;
      varying vec3 vPosition, vNormal;
      uniform vec3 eye;
      uniform mat4 view;
      uniform bool wire;
      varying vec2 vUV;
      uniform float fatEdge, posClip, negClip, shittyEversion, pixelRatio, section, strips;

      #define PI 3.141592653589

      float gridFactor (vec2 parameter, float width, float feather) {
        float w1 = width - feather * 0.5;
        vec2 d = fwidth(parameter);
        vec2 looped = 0.5 - abs(mod(parameter, 1.0) - 0.5);
        vec2 a2 = smoothstep(d * w1, d * (w1 + feather), looped);
        return min(a2.x, a2.y);
      }

      float gridFactor (float parameter, float width, float feather) {
        float w1 = width - feather * 0.5;
        float d = fwidth(parameter);
        float looped = 0.5 - abs(mod(parameter, 1.0) - 0.5);
        return smoothstep(d * w1, d * (w1 + feather), looped);
      }

      float stripeFactor (float parameter, float width, float feather) {
        float w1 = width - feather * 0.5;
        float d = fwidth(parameter);
        return smoothstep(d * w1, d * (w1 + feather), abs(parameter));
      }


      void main () {
        float divFunc = section - vPosition.y;
        if (divFunc < 0.0) {
          discard;
          return;
        }
        float divider = abs(divFunc) > 0.04 ? 1.0 : stripeFactor(divFunc, 3.0 * pixelRatio, 1.0);

        vec3 dPdx = dFdx(vPosition);
        vec3 dPdy = dFdy(vPosition);
        vec3 normal = normalize(cross(dPdx, dPdy));
        normal = normalize(vNormal);

        float vDotN = abs(dot(normal, normalize(vPosition - eye)));
        float vDotNGrad = fwidth(vDotN);
        float cartoonEdge = smoothstep(0.75, 1.25, vDotN / vDotNGrad / 3.0 / pixelRatio);

        float sgn = gl_FrontFacing ? 1.0 : -1.0;

        float grid = gridFactor(vUV * vec2(2.0, 1.0) * 8.0 / PI, 0.45 * pixelRatio, 1.0);

        float fatGrid = gridFactor((vUV.x * 0.638 + negClip) / (posClip + negClip), 7.0 * pixelRatio, 1.0);
        if (abs(vUV.x) < 0.7) fatGrid = 1.0;
        fatGrid = mix(1.0, fatGrid, fatEdge);

        vec3 baseColor = gl_FrontFacing ? vec3(0.9, 0.2, 0.1) : vec3(0.1, 0.4, 0.8);
        float shade = mix(1.0, pow(vDotN, 3.0), 0.5) + 0.2;

        float bad = smoothstep(0.8, 1.0, shittyEversion);

        if (fract(vUV.y * (0.5 / PI) * strips) > 0.5) discard; 

        if (wire) {
          vec3 gridColor = mix(
            vec3(1),
            vec3(0, 1, 1),
            cartoonEdge * grid * bad * (abs(vPosition).y < 0.1 ? 1.0 : 0.0)
          );
          gl_FragColor.rgb = gridColor;
          gl_FragColor.a = mix(
            0.15,
            (1.0 - grid) * 0.055,
            cartoonEdge
          );
          gl_FragColor.a += 0.12 * bad * (abs(vPosition).y < 0.1 ? 1.0 : 0.0);

          //gl_FragColor = mix(vec4(0.0, 1.0, 1.0, 1.0), gl_FragColor, divider);

          if (gl_FragColor.a < 1e-3) discard;
        } else {
          baseColor = mix(
            baseColor,
            vec3(1, 0, 0),
            0.55 * bad * (abs(vPosition).y < 0.1 ? 1.0 : 0.0)
          );

          gl_FragColor = vec4(pow(
            mix(baseColor, (0.5 + sgn * 0.5 * normal), 0.4) * cartoonEdge * mix(1.0, 0.6, 1.0 - grid) * shade,
            vec3(0.454)),
            1.0);

          gl_FragColor = mix(vUV.x > 0.0 ? vec4(1, 0.1, 0.2, 1) : vec4(0.4, 0.2, 1, 1), gl_FragColor, fatGrid);

        }
        gl_FragColor.rgb = mix(vec3(0.0, 1.0, 0.2), gl_FragColor.rgb, divider);
      }
    `,
    uniforms: {
      t: regl.prop('t'), 
      q: regl.prop('q'), 
      Qinv: regl.prop('Qinv'), 
      xi: regl.prop('xi'), 
      eta: regl.prop('eta'), 
      alpha: regl.prop('alpha'), 
      beta: regl.prop('beta'), 
      lambda: regl.prop('lambda'), 
      omega: regl.prop('omega'), 
      scale: regl.prop('scale'), 
      translation: regl.prop('translation'), 
      n: regl.prop('n'), 
      wire: regl.prop('wire'),
      stereo: regl.prop('stereo'),
      posClip: regl.prop('posClip'),
      negClip: regl.prop('negClip'),
      rotation: regl.prop('rotation'),
      fatEdge: regl.prop('fatEdge'),
      strips: regl.prop('strips'),
      shittyEversion: regl.prop('shittyEversion'),
      pixelRatio: regl.context('pixelRatio'),
      section: (ctx, props) => Math.sinh(props.section * 1.2),
    },
    attributes: {
      uv: positionsBuffer,
    },
    depth: {
      enable: (ctx, props) => props.wire ? false : true
    },
    blend: {
      enable: (ctx, props) => props.wire ? true : false,
      func: {
        srcRGB: 'src alpha',
        srcAlpha: 1,
        dstRGB: 1,
        dstAlpha: 1,
      },
      equation: {
        rgb: 'reverse subtract',
        alpha: 'add',
      }
    },
    elements: elementsBuffer
  });
}
