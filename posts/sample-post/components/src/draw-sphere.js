const meshSurface = require('../../../../common/mesh/mesh-surface-2d');

module.exports = function (regl, res) {
  const mesh = meshSurface({}, (out, u, v) => {
    out[0] = u;
    out[1] = v;
    return out;
  }, {
    resolution: [201, 201],
    uDomain: [0, 1],
    vDomain: [-Math.PI, Math.PI],
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

      uniform float t, time;

      float sinc (float x) {
        if (x < 1e-4) return 1.0 - x * x;
        return sin(x) / x;
      }

      vec3 f(vec2 uv) {
        float r2 = dot(uv, uv);
        float s = 12.0 * sqrt(r2);
        float t = time * 4.0;
        return vec3(
          uv.x * 2.0,
          cos(s - t) / sqrt(1.0 + s * s),
          uv.y * 2.0
        );
      }

      void main () {
        vUV = uv.x * vec2(cos(uv.y), sin(uv.y));
        vPosition = f(vUV);

        float dx = 1e-3;
        vec3 pu = f(vUV + vec2(dx, 0));
        vec3 pv = f(vUV + vec2(0, dx));
        vec3 dpdu = pu - vPosition;
        vec3 dpdv = pv - vPosition;
        vNormal = normalize(cross(dpdu, dpdv));

        gl_Position = projection * view * vec4(vPosition, 1);
      }
    `,
    frag: `
      #extension GL_OES_standard_derivatives : enable
      precision highp float;
      varying vec3 vPosition, vNormal;
      uniform vec3 eye;
      uniform bool wire;
      varying vec2 vUV;
      uniform float pixelRatio;

      float gridFactor (vec2 parameter, float width, float feather) {
        float w1 = width - feather * 0.5;
        vec2 d = fwidth(parameter);
        vec2 looped = 0.5 - abs(mod(parameter, 1.0) - 0.5);
        vec2 a2 = smoothstep(d * w1, d * (w1 + feather), looped);
        return min(a2.x, a2.y);
      }

      void main () {
        vec3 normal = normalize(vNormal);
        float vDotN = abs(dot(normal, normalize(vPosition - eye)));
        float vDotNGradient = fwidth(vDotN);
        float cartoonEdge = smoothstep(0.75, 1.25, vDotN / vDotNGradient / 3.0 / pixelRatio);

        float grid = gridFactor(vUV * 10.0, 0.45 * pixelRatio, 1.0);

        if (wire) {
          gl_FragColor = vec4(
            vec3(1),
            mix(0.15, (1.0 - grid) * 0.055, cartoonEdge)
          );

          if (gl_FragColor.a < 1e-3) discard;
        } else {
          float sgn = gl_FrontFacing ? 1.0 : -1.0;
          float shade = mix(1.0, pow(vDotN, 3.0), 0.5) + 0.2;
          vec3 baseColor = gl_FrontFacing ? vec3(0.9, 0.2, 0.1) : vec3(0.1, 0.4, 0.8);

          gl_FragColor = vec4(pow(
            mix(baseColor, (0.5 + sgn * 0.5 * normal), 0.4) * cartoonEdge * mix(1.0, 0.6, 1.0 - grid) * shade,
            vec3(0.454)),
            1.0
          );
        }
      }
    `,
    primitive: 'triangles',
    uniforms: {
      wire: regl.prop('wire'),
      pixelRatio: regl.context('pixelRatio'),
      t: regl.prop('t'),
      time: regl.context('time'),
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
