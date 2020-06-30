const Eversion = require('./eversion');
const createREGL = require('regl');
const State = require('controls-state');
const GUI = require('controls-gui');


const regl = createREGL({
  extensions: [
    'OES_standard_derivatives'
  ]
});

const state = GUI(State({
  eq4: false,
  n: State.Slider(2, {min: 2, max: 6, step: 1}),
  t: State.Slider(1.5, {min: -1.5, max: 1.5, step: 0.01}),
  alpha: State.Slider(1, {min: 0, max: 1.5, step: 0.01, label: 'α'}),
  beta: State.Slider(1 / 25, {min: 0, max: 1.5, step: 0.001, label: 'β'}),
  q: State.Slider(2 / 3, {min: 0, max: 1.5, step: 0.01}),
  eta: State.Slider(1, {min: 0, max: 1.5, step: 0.01, label: 'η'}),
  xi: State.Slider(1, {min: 0, max: 1.5, step: 0.01, label: 'ξ'}),
  lambda: State.Slider(1, {min: 0, max: 1, step: 0.01, label: 'λ'}),
  omega: State.Slider(2, {min: 1, max: 3, step: 0.5, label: 'ω'}),
  scale: State.Slider(0.5, {min: 0, max: 3, step: 0.1, label: 'scale'}),
  translation: State.Slider(0.5, {min: 0, max: 3, step: 0.1, label: 'translation'}),
  limit: State.Slider(0, {min: 0, max: 1, step: 0.01, label: 'limit'}),
  rotation: State.Slider(0, {min: 0, max: 1, step: 0.01, label: 'rotation'}),
  section: State.Slider(2, {min: -2, max: 2, step: 0.01, label: 'rotation'}),
  negClip: 1,
  posClip: 1,
  shittyEversion: 0,
  stereo: 1,
  Qinv: 0,
  fatEdge: 100,
}));

state.getState = function () { return this; }

const eversion = new Eversion(regl, {state, wheel: true, res: 150});
state.$onChange(eversion.redraw);

