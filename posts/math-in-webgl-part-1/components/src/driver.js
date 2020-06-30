const Feature = require('./feature');
const createREGL = require('regl');
const State = require('controls-state');
const GUI = require('controls-gui');

const regl = createREGL({
  pixelRatio: window.devicePixelRatio,
  extensions: [
    'OES_standard_derivatives'
  ]
});

const state = GUI(State({
  t: State.Slider(0.0, {min: 0, max: 20, step: 0.1, label: 't'}),
  baseRendering: true,
  fakeTransparency: false,
}));

state.getState = function () { return this; }

const feature = new Feature(regl, {
  state,
  wheel: true,
  dpi: window.devicePixelRatio
});
state.$onChange(feature.redraw);

