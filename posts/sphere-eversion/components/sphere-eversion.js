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
    this._section = {t: 0, value: 10};

    const story = sequencer({
      section: [this._section],
      shittyEversion: [
        {t: 0, value: 0},
      ],
      color: [
        {t: t0 + 0, value: 0.0},
        {t: t0 + 6, value: 1.0, ease: eases.linear },
      ],
      n: [
        {t: t0 + 0, value: 2},
      ],
      posClip: [
        {t: t0 + 0, value: 1},
      ],
      negClip: [
        {t: t0 + 0, value: 1},
      ],
      stereo: [
        {t: t0 + 0.5, value: 1},
      ],
      fatEdge: [
        {t: t0, value: 0},
      ],
      rotation: [
        {t: t0 - 3, value: 1 * 0},
        {t: t0 + 0, value: 0},
        {t: t0 + 5.5, value: 0},
        {t: t0 + 9, value: 1 * 0},
      ],
      translation: [
        {t: t0 + 0, value: 0.5},
        {t: t0 + 0.7, value: 1.4},
        {t: t0 + 2, value: 1},
        {t: t0 + 4, value: 1},
        {t: t0 + 5.3, value: 1.4},
        {t: t0 + 6, value: 0.5},
      ],
      scale: [
        {t: t0 + 0, value: 1.5 / Math.pow(Q, 0.5)},
        {t: t0 + 1, value: 0.6},
        {t: t0 + 1.5, value: 0.7},
        {t: t0 + 4.5, value: 0.7},
        {t: t0 + 5, value: 0.6},
        {t: t0 + 6, value: 1.5 / Math.pow(Q, 0.5)},
      ],
      limit: [
        {t: 0, value: 0},
      ],
      t: [
        {t: t0 + 0, value: 1 / Q},
        {t: t0 + 2, value: 1 / Q},
        {t: t0 + 4, value: -1 / Q},
        {t: t0 + 6, value: -1 / Q},
      ],
      alpha: [
        {t: t0 + 0, value: 1e-5},
        {t: t0 + 1, value: 1},
        {t: t0 + 5, value: 1},
        {t: t0 + 6, value: 1e-5},
      ],
      beta: [
        {t: t0 + 0, value: 1},
        {t: t0 + 1, value: 1 / 20},
        {t: t0 + 5, value: 1 / 20},
        {t: t0 + 6, value: 1},
      ],
      q: [
        {t: t0 + 0, value: Q},
      ],
      eta: [
        {t: t0 + 0, value: 1},
      ],
      xi: [
        {t: t0 + 0, value: 0},
        {t: t0 + 2, value: 1},
        {t: t0 + 4, value: 1},
        {t: t0 + 5, value: 0},
        {t: t0 + 6, value: 0},
      ],
      lambda: [
        {t: t0 + 0, value: 0},
        {t: t0 + 2, value: 1},
        {t: t0 + 4, value: 1},
        {t: t0 + 6, value: 0},
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

    const passiveScrollChannel = props.passiveScrollChannel;

    this.eversion = createEversion(this.regl, {
      scroll: passiveScrollChannel,
      state: story,
      dpi,
      res: preferredRes
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
    if (this._section !== undefined && nextProps.section !== undefined) { this._section.value = nextProps.section;
      this.eversion.redraw();
    }
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
