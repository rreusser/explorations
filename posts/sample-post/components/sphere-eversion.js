const React = require('react');
const createREGL = require('regl/regl.js');
const createFeature = require('./src/feature');
const sequencer = require('./src/sequencer');
const eases = require('eases');

class Feature extends React.Component {
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

    const story = sequencer({
      a: [
        {t: 0, value: -1},
        {t: 1, value: 1},
      ],
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

    this.eversion = createFeature(this.regl, {
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

module.exports = Feature;
