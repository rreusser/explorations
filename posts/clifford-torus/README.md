# Clifford Torus

This directory contains the source to the [Clifford Torus](https://rreusser.github.io/explorations/clifford-torus/).

A [Clifford torus](https://en.wikipedia.org/wiki/Clifford_torus) is defined by the Cartesian product of two circles:

```
(x, y, z, w) = (cos(θ), sin(θ), cos(φ), sin(φ)) / √2
```

Where (θ, φ) ∈ [0, 2π] ⨉ [0, 2π]. You then apply a rotation—here I'm applying the camera controller's view matrix to the x-y-w coordinates—and then compute a stereographic projection into three dimensions:

```
(x', y', z') = (x, y, z) / (1 - w)
```

It uses the [regl](https://github.com/regl-project/regl) library for interfacing with WebGL and uses [this shader technique](https://observablehq.com/@rreusser/faking-transparency-for-3d-surfaces) for drawing the surface.

There are some shared dependencies a couple directories up, so you'll need to run `npm install` both in the root project directory and in this directory:

```sh
git clone https://github.com/rreusser/explorations.git
cd explorations
npm install
cd posts/clifford-torus
npm install
npm start
```

## License

&copy; 2020 Ricky Reusser. MIT License.

