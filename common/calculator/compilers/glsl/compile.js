function compile(op, independent) {
  var variables = {};

  function unwrap(op) {
    if (op.op !== 'group') return op;
    return op.operands[0];
  }

  function compile(op) {
    switch (op.op) {
      case 'realvalue':
        return `vec2(${op.value}, 0)`;
      case 'imagvalue':
        return `vec2(0, ${op.value})`;
      case 'complexvalue':
        return `vec2(${op.value[0]}, ${op.value[1]})`;
      case 'variable':
        variables[op.name] = true;
        return op.name;
      case 'uminus':
        return `(-(${compile(unwrap(op.operands[0]))}))`;
      case 'add':
        return `${compile(op.operands[0])} + ${compile(op.operands[1])}`;
      case 'sub':
        return `${compile(op.operands[0])} - ${compile(op.operands[1])}`;
      case 'mul':
        return `cmul(${compile(unwrap(op.operands[0]))}, ${compile(
          unwrap(op.operands[1])
        )})`;
      case 'div':
        return `cdiv(${compile(unwrap(op.operands[0]))}, ${compile(
          unwrap(op.operands[1])
        )})`;
      case 'group':
        return `(${compile(op.operands[0])})`;
      case 'pow':
        var fn = glslFunctionMapping[op.op];
        return `${fn}(${op.operands
          .map(op => compile(unwrap(op)))
          .join(', ')})`;
      case 'function':
        switch (op.name) {
          case 'pow':
            var fn = glslFunctionMapping[op.name];
            return `${fn}(${op.operands
              .map(op => compile(unwrap(op)))
              .join(', ')})`;
          default:
            var fn = glslFunctionMapping[op.name];
            if (!fn) throw new Error(`Unknown function "${op.name}"`);
            return `${fn}(${op.operands.map(compile).join(', ')})`;
        }
      default:
        throw new Error(`Unhandled operation "${op.op}"`);
    }

    return compile(op);
  }

  var result = compile(op, variables);
  delete variables[independent];

  module.exports = {
    independent: independent,
    variables: Object.keys(variables),
    expression: result
  };
};
