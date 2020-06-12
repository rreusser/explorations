module.exports = Smoother;

function Smoother (initialValue, timeConstant) {
  this.tTock = Date.now() / 1000;
  this.tTick = Date.now() / 1000;

  this.value = initialValue;
  this.target = initialValue;
  this.alpha = Math.log(2) / timeConstant;
}

Smoother.prototype.tick = function () {
  this.tTock = this.tTick;
  this.tTick = Date.now() / 1000;

  const dt = this.tTick - this.tTock;
  this.value += (this.target - this.value) * (1.0 - Math.exp(-dt * this.alpha));

  return this.value;
}

Smoother.prototype.setTarget = function (target) {
  this.target = target;
};

Smoother.prototype.getValue = function () {
  return this.value;
};

Smoother.prototype.getSlope = function () {
  const t = Date.now() / 1000;
  return -(this.target - this.value) * Math.exp(-(t - this.tTick) * this.alpha);
};

