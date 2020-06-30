const React = require('react');
const createREGL = require('regl/regl.js');
const createEversion = require('./src/eversion');
const sequencer = require('./src/sequencer');
const eases = require('eases');

class SphereEversion extends React.Component {
  initializeREGL (ref, props) {
    if (!ref || this.regl) return;

    ref.style.top = '0';
    ref.style.left = '0';
    ref.style.width = '100%';
    ref.style.height = '100%';
    ref.style.display = 'block';

    const canvas = document.createElement('canvas');
    ref.appendChild(canvas);
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.cursor = 'grab';
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
      canvas.width = Math.floor(ref.offsetWidth * dpi);
      canvas.height = Math.floor(ref.offsetHeight * dpi);
    }
    requestAnimationFrame(() => {
      this.resize();
    })

    const Q = 2 / 3;

    this.eversionState = {
      section: 10,
      color: 0.0,
      n: 2,
      rotation: 0,
      translation: 0,
      scale: 0.45,
      stereo: 0,
      posClip: 0.5,
      negClip: 0.5,
      fatEdge: 0,
      strips: 0,
      shittyEversion: 0,
      t: 1 / Q - 1e-4,
      alpha: 1,
      beta: 1 / 20,
      q: Q,
      eta: 1,
      xi: 0,
      lambda: 1,
      omega: 2,
      Qinv: 1 / Q,

      getState () {
        return this;
      }
    };

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
      state: this.eversionState,
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
    Object.assign(this.eversionState, nextProps || {});
    this.eversionState.Qinv = 1.0 / this.eversionState.q;
    switch(this.eversionState.n) {
      default:
      case 2:
        this.eversionState.scale = 0.45;
        this.eversionState.posClip = 0.5;
        this.eversionState.negClip = 0.5;
        break;
      case 3:
        this.eversionState.scale = 0.6;
        this.eversionState.posClip = 0.4;
        this.eversionState.negClip = 0.4;
        break;
      case 4:
        this.eversionState.scale = 0.75;
        this.eversionState.posClip = 0.3;
        this.eversionState.negClip = 0.3;
        break;
    }
    this.eversion.redraw();

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
