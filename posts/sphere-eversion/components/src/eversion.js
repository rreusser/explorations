const Smoother = require('../../../../common/smoother');
const createDrawSphere = require('./draw-sphere');
const createCamera = require('./camera');

module.exports = function Eversion (regl, props) {
  function getAspectRatio () {
    return regl._gl.canvas.offsetWidth / regl._gl.canvas.offsetHeight;
  }

  const ar = getAspectRatio();
  let scale = ar > 1.0 ? 1.0 : ar;

  const camera = createCamera(regl, {
    distance: 6,
    damping: 0,
    near: 0.1,
    far: 10.0,
    theta: 0.1,
    phi: props.phi === undefined ? 0.7 : props.phi,
    renderOnDirty: false,
    noScroll: true,
    wheel: props.wheel
  });

  const smoothedScroll = new Smoother(0.0, 0.05);

  const drawSphere = createDrawSphere(regl, props.res);

  let dirty = true;

  window.addEventListener('resize', () => {
    regl._gl.canvas.width = Math.floor(props.dpi * regl._gl.canvas.offsetWidth);
    regl._gl.canvas.height = Math.floor(props.dpi * regl._gl.canvas.offsetHeight);
    camera.taint()
    const ar = getAspectRatio();
    scale = ar > 1.0 ? 1.0 : ar;
  });

  let frame = regl.frame(({tick}) => {
    try {
      let drawn = false;

      if (props.scroll) {
        smoothedScroll.setTarget(props.scroll.position * (props.scroll.frameCount - 1));
        smoothedScroll.tick();
      }
      
      if (props.state.setPosition) {
        props.state.setPosition(smoothedScroll.getValue());
      }

      if (Math.abs(smoothedScroll.getSlope()) > 1e-4) dirty = true;

      camera(cameraState => {
        if (!dirty && !cameraState.dirty) return;
        drawn = true;

        const state = props.state.getState()

        regl.clear({color: [1, 1, 1, 1]});

        drawSphere({wire: false, ...state, scale: state.scale * scale});
        drawSphere({wire: true, ...state, scale: state.scale * scale});
      });

      if (drawn) dirty = false;
    } catch (e) {
      console.error(e);
      frame.cancel();
      frame = null;
    }
  });

  return {
    destroy: function () {
      if (!frame) return;
      frame.cancel();
      frame = null;
    },
    redraw: function () {
      dirty = true;
    }
  }
}
