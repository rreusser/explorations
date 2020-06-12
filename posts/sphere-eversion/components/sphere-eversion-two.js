const React = require('react');
const createREGL = require('regl/regl.js');
const createEversion = require('./src/eversion');
const sequencer = require('./src/sequencer');
const eases = require('eases');

class SphereEversion extends React.Component {
  initializeREGL (ref, props) {
    if (!ref || this.regl) return;

    const canvas = document.createElement('canvas');
    ref.appendChild(canvas);
    canvas.style.width = "100%";
    canvas.style.height = '100vh';
    canvas.style.display = 'block';
    this.canvas = canvas;

    let preferredDPI;
    let preferredRes;
    switch(props.quality) {
      case 'low':
        preferredDPI = 1;
        preferredRes = 75;
        break;
      default:
      case 'medium':
        preferredDPI = 1.5;
        preferredRes = 150;
        break;
      case 'high':
        preferredDPI = 2.0;
        preferredRes = 255;
        break;
    }

    const dpi = Math.min(preferredDPI, window.devicePixelRatio);
    this.resize = function resize () {
      canvas.width = Math.floor(window.innerWidth * dpi);
      canvas.height = Math.floor(window.innerHeight * dpi);
    }

    const Q = 2 / 3;
    const t0 = 1.0;
    const t1 = t0 + 2.0;
    const t1p = t1 + 1.0;
    const t2 = t1 + 7.0;
    const t3 = t2 + 2.0;
    const t4 = t3 + 2.0;
    const t5 = t4 + 2.0;

    this.nn = {t: t0 + 0, value: 2};

    const story = sequencer({
      color: [
        {t: t0 + 0, value: 0.0},
        {t: t0 + 6, value: 1.0, ease: eases.linear },
      ],
      n: [this.nn],
      rotation: [
        {t: t0 - 3, value: 2},
        {t: t0 + 0, value: 0},
        {t: t1 + 6, value: 0},
        {t: t1 + 9, value: 0},
      ],
      translation: [
        {t: t0 + 0.5, value: 1},
        {t: t1, value: 0},
        {t: t4, value: 0},
        {t: t5 - 0.5, value: 1},
      ],
      scale: [
        {t: t0 + 1, value: 0.5},
        {t: t1, value: 0.4},
        {t: t4, value: 0.4},
        {t: t5 - 1, value: 0.5},
      ],
      stereo: [
        {t: t0 + 0.75, value: 1},
        {t: t1, value: 0},
        {t: t4, value: 0},
        {t: t5 - 0.75, value: 1},
      ],
      posClip: [
        {t: t0 + 0.25, value: 1},
        {t: t0 + 1.25, value: 0.5},
        {t: t5 - 1.0, value: 0.5},
        {t: t5 + 0.5, value: 1},
      ],
      negClip: [
        {t: t0 + 0.0, value: 1},
        {t: t0 + 1.0, value: 0.5},
        {t: t5 - 1.5, value: 0.5},
        {t: t5 + 0.0, value: 1},
      ],
      fatEdge: [
        {t: t1 + 0.25, value: 0},
        {t: t1 + 0.5, value: 1},
        {t: t4 - 0.5, value: 1},
        {t: t4 + 0.25, value: 0},
      ],
      shittyEversion: [
        {t: t1p, value: 0},
        {t: t1p + 1.0, value: 1},
        {t: t1p + 2.0, value: 1},
        {t: t1p + 3.0, value: 0},
      ],
      t: [
        {t: t2, value: 1 / Q},
        {t: t3, value: -1 / Q},
        {t: t4, value: -1 / Q},
      ],
      alpha: [
        {t: t0, value: 1},
      ],
      beta: [
        {t: t0, value: 1 / 20},
      ],
      q: [
        {t: t0 + 0, value: Q},
      ],
      eta: [
        {t: t0 + 0, value: 1},
      ],
      xi: [
        {t: t2 + 0, value: 1},
        {t: t2 + 1, value: 0},
        {t: t3 + 1, value: 0},
        {t: t4 + 0, value: 0},
      ],
      lambda: [
        {t: t1p + 4, value: 0},
        {t: t2 - 1, value: 1},
        {t: t3, value: 1},
        {t: t4, value: 0},
      ],
      omega: [
        {t: t0 + 0, value: 2},
      ],
      Qinv: [
        {t: t0 + 0, value: 1 / Q},
      ]
    });

    this.regl = createREGL({
      canvas: canvas,
      pixelRatio: dpi,
      extensions: [
        'OES_standard_derivatives'
      ]
    });

    window.addEventListener('resize', this.resize);
    this.resize();

    const passiveScrollChannel = this.props.passiveScrollChannel;

    this.eversion = createEversion(this.regl, {
      scroll: passiveScrollChannel,
      state: story,
      res: preferredRes,
      dpi,
      phi: 0.4
    });
  }

  destroy () {
    if (this.regl) {
      window.removeEventListener('resize', this.resize);
      if (this.eversion) this.eversion.destroy();
      if (this.regl) this.regl.destroy();
      this.ref.removeChild(this.canvas);
      this.regl = null;
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.quality !== this.props.quality) {
      this.destroy()
      this.initializeREGL(this.ref, nextProps);
    }
  }

  getRef (ref) {
    this.ref = ref;
    this.initializeREGL(ref, this.props);
  }

  componentWillUnmount () {
    this.destroy()
  }

  render () {
    return  <div
      ref={this.getRef.bind(this)}
      style={{width:'100%'}}
    ></div>
  }
}

module.exports = SphereEversion;
