module.exports = function staticAnalyzer(expr) {
  var stack = [expr];

  function getStaticValue(op) {
    switch (op.op) {
      case 'realvalue':
        return [op.value, 0];
      case 'imagvalue':
        return [0, op.value];
      case 'complexvalue':
        return op.value;
      case 'uminus':
        var value = getStaticValue(op.operands[0]);
        return [-value[0], -value[1]];
      case 'group':
        return getStaticValue(op.operands[0]);
      case 'add':
        return complex.addSS(
          [],
          getStaticValue(op.operands[0]),
          getStaticValue(op.operands[1])
        );
      case 'sub':
        return complex.subSS(
          [],
          getStaticValue(op.operands[0]),
          getStaticValue(op.operands[1])
        );
      case 'mul':
        return complex.mulSS(
          [],
          getStaticValue(op.operands[0]),
          getStaticValue(op.operands[1])
        );
      case 'div':
        return complex.divSS(
          [],
          getStaticValue(op.operands[0]),
          getStaticValue(op.operands[1])
        );
      case 'function':
        switch (op.name) {
          case 'sqrt':
            return complex.sqrtS([], getStaticValue(op.operands[0]));
          default:
            console.error(
              'Unable to compute static value for function:',
              op.name
            );
            throw new Error(
              `Unable to get static value for function "${op.name}"`
            );
        }
      case 'sqrt':
      default:
        console.error('Unable to compute static value for:', op);
        throw new Error('Unable to get static value');
    }
  }

  function hasStaticValue(op) {
    if (op.operands) {
      return op.operands.every(hasStaticValue);
    }

    switch (op.op) {
      case 'realvalue':
      case 'imagvalue':
      case 'complexvalue':
        return true;
      default:
        return false;
    }
  }

  function simplify(op) {
    if (!hasStaticValue) return op;

    op.value = getStaticValue(op);
    op.op = 'complexvalue';
    delete op.operands;
  }

  var canSimplify = true;
  while (canSimplify) {
    canSimplify = false;
    while (stack.length) {
      var op = stack.pop();
      if (!op.operands) continue;

      if (hasStaticValue(op)) {
        canSimplify = true;
        simplify(op);
      } else {
        stack.push.apply(stack, op.operands || []);
      }
    }
  }

  return expr;
};
