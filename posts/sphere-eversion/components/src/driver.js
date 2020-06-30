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
  stereo: State.Slider(1, {min: 0, max: 1, step: 0.01, label: 'stereographic'}),
  strips: State.Slider(0, {min: 0, max: 16, step: 1, label: 'strips'}),
  foo: State.Raw(h => h('p', {}, 'This is just a debug area for sphere eversion using the method of ',
    h('a', {href: 'https://arxiv.org/abs/1711.10466'}, 'Bednorz and Bednorz'),
    '. The main controls are to', h('ol', {}, [
    h('li', {}, 'Move t from 1.5 to -1.5 to perform the eversion'),
    h('li', {}, 'Move λ from 1 to 0 to untwist the sphere.'),
  ]),
  h('p', {}, `I couldn't quite get thing working as expected so that I had to swap equations rather than using single equation all the way through. As a result, λ only has an effect when t = ±1.5. For the full article, see `,
    h('a', {href: "https://rreusser.github.io/explorations/sphere-eversion/"}, 'Sphere Eversion.')
  )
))}), {
  containerCSS: 'max-width: 170px'
});

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

const eversion = new Eversion(regl, {state, wheel: true, res: 250, far: 100});
state.$onChange(eversion.redraw);

