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
  n: State.Slider(2, {min: 2, max: 6, step: 1}),
  t: State.Slider(1.5, {min: -1.5, max: 1.5, step: 0.01}),
  alpha: State.Slider(1, {min: 0, max: 1.5, step: 0.01, label: 'α'}),
  beta: State.Slider(1 / 25, {min: 0, max: 1.5, step: 0.001, label: 'β'}),
  q: State.Slider(2 / 3, {min: 0, max: 1.5, step: 0.01}),
  eta: State.Slider(1, {min: 0, max: 1.5, step: 0.01, label: 'η'}),
  xi: State.Slider(1, {min: 0, max: 1.5, step: 0.01, label: 'ξ'}),
  lambda: State.Slider(1, {min: 0, max: 1, step: 0.01, label: 'λ'}),
  omega: State.Slider(2, {min: 1, max: 3, step: 0.5, label: 'ω'}),
  //section: State.Slider(2, {min: -2, max: 2, step: 0.01, label: 'section'}),
  stereo: State.Slider(0, {min: 0, max: 1, step: 0.01, label: 'stereographic'}),
  strips: State.Slider(4, {min: 0, max: 16, step: 1, label: 'strips'}),
}));

function update () {
  state.Qinv = 1.0 / state.q;
  state.shittyEversion = 0;
  state.fatEdge = 0;
  state.translation = 0;
  state.scale = 0.5;
  state.rotation = 0;
  state.limit = 0;
  state.negClip = 1 - Math.pow(1 - state.stereo, 0.7) * 0.5
  state.posClip = 1 - Math.pow(1 - state.stereo, 0.7) * 0.5
  state.section = 4
}

state.$onChange(update);
update();

state.getState = function () { return this; }

const eversion = new Eversion(regl, {state, wheel: true, res: 250});
state.$onChange(eversion.redraw);

