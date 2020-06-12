const simplify = require('./simplify');
const parseExpr = require('./calculator');

module.exports = function (expr) {
  return simplify(parseExpr(expr));
};
