const { Expr } = require('../../dist/Types/Expr')
const { Callable } = require('../../dist/Types/Callable')


const callables = Object.create(null)

callables['s'] = new Callable(
  ['x', 'y', 'z'],
  Expr.fromJSON({
    type: 'Apply',
    left: {
      type: 'Apply',
      left: {
        type: 'Variable',
        label: 'x',
      },
      right: {
        type: 'Variable',
        label: 'z',
      },
    },
    right: {
      type: 'Apply',
      left: {
        type: 'Variable',
        label: 'y',
      },
      right: {
        type: 'Variable',
        label: 'z',
      },
    },
  })
)

callables['k'] = new Callable(
  ['x', 'y'],
  Expr.fromJSON({
    type: 'Variable',
    label: 'x',
  })
)

callables['i'] = new Callable(
  ['x'],
  Expr.fromJSON({
    type: 'Variable',
    label: 'x',
  })
)

module.exports = callables
