const createREGL = require('regl');
const createCamera = require('../../common/gl/regl-turntable-camera');
const meshSurface = require('../../common/mesh/mesh-surface-2d');
const mat4create = require('gl-mat4/create');
const mat4multiply = require('gl-mat4/multiply');
const mat4lookAt = require('gl-mat4/lookAt');

function createDrawCliffordTorus (regl, res) {
  const mesh = meshSurface({}, (out, u, v) => {out[0] = u, out[1] = v}, {
    resolution: [res, res],
    uDomain: [-Math.PI, Math.PI],
    vDomain: [-Math.PI, Math.PI],
  });

  return regl({
    vert: `
      precision highp float;
      attribute vec2 uv;
      uniform mat4 uProjection, uView, uFixedView;
      varying vec3 vPosition, vNormal;
      varying vec2 vUV;

      vec3 f(vec2 uv) {
        vec4 p = vec4(cos(uv.x), sin(uv.x), cos(uv.y), sin(uv.y)) / sqrt(2.0);
        p.xyw = mat3(uView) * p.xyw;
        return p.xyz / (1.0 - p.w);
      }

      void main () {
        vUV = uv;
        vPosition = f(vUV);

        // Compute the normal via numerical differentiation
        const float dx = 2e-3;
        vNormal = normalize(cross(
          f(vUV + vec2(dx, 0)) - vPosition,
          f(vUV + vec2(0, dx)) - vPosition
        ));

        gl_Position = uProjection * uFixedView * vec4(vPosition, 1);
      }
    `,
    frag: `
      #extension GL_OES_standard_derivatives : enable
      precision highp float;
      varying vec3 vPosition, vNormal;
      uniform vec3 uFixedEye;
      uniform bool wire;
      varying vec2 vUV;
      uniform float pixelRatio;

      #define PI 3.141592653589

      float gridFactor (vec2 parameter, float width, float feather) {
        float w1 = width - feather * 0.5;
        vec2 d = fwidth(parameter);
        vec2 looped = 0.5 - abs(mod(parameter, 1.0) - 0.5);
        vec2 a2 = smoothstep(d * w1, d * (w1 + feather), looped);
        return min(a2.x, a2.y);
      }

      void main () {
        vec3 normal = normalize(vNormal);
        float vDotN = abs(dot(normal, normalize(vPosition - uFixedEye)));
        float vDotNGrad = fwidth(vDotN);
        float cartoonEdge = smoothstep(0.75, 1.25, vDotN / vDotNGrad / 3.0 / pixelRatio);
        float sgn = gl_FrontFacing ? 1.0 : -1.0;
        float grid = gridFactor(vUV * vec2(2.0, 2.0) * 8.0 / PI, 0.45 * pixelRatio, 1.0);
        vec3 baseColor = gl_FrontFacing ? vec3(0.9, 0.2, 0.1) : vec3(0.1, 0.4, 0.8);
        float shade = mix(1.0, pow(vDotN, 3.0), 0.5) + 0.2;

        if (wire) {
          gl_FragColor.rgb = vec3(1);
          gl_FragColor.a = mix(0.15, (1.0 - grid) * 0.055, cartoonEdge);
        } else {
          gl_FragColor = vec4(pow(
            mix(baseColor, (0.5 + sgn * 0.5 * normal), 0.4) * cartoonEdge * mix(1.0, 0.6, 1.0 - grid) * shade,
            vec3(0.454)),
            1.0);
        }
      }
    `,
    uniforms: {
      wire: regl.prop('wire'),
      pixelRatio: regl.context('pixelRatio'),
      uFixedView: () => mat4lookAt([], [0, 0, camera.params.distance], [0, 0, 0], [0, 1, 0]),
      uFixedEye: () => [0, 0, camera.params.distance],
    },
    attributes: {uv: mesh.positions},
    depth: {enable: (ctx, props) => props.wire ? false : true},
    blend: {
      enable: (ctx, props) => props.wire ? true : false,
      func: {srcRGB: 'src alpha', srcAlpha: 1, dstRGB: 1, dstAlpha: 1},
      equation: {rgb: 'reverse subtract', alpha: 'add'}
    },
    elements: mesh.cells
  });
}

const regl = createREGL({extensions: ['OES_standard_derivatives']});

const camera = createCamera(regl, {
  distance: 8,
  theta: 0.0,
  phi: 0.0,
  far: 200,
});

const drawTorus = createDrawCliffordTorus(regl, 150);

let frame = regl.frame(({tick, time}) => {
  camera(({dirty}) => {
    if (!dirty) return;
    regl.clear({color: [1, 1, 1, 1]});

    drawTorus([
      {wire: false},
      {wire: true}
    ]);
  });
});
