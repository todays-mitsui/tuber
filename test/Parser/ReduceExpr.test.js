const { Expr } = require('../../dist/Types/Expr')
const { Context } = require('../../dist/Context')
const exprs = require('./exprs')
const callables = require('./callables')

const context = new Context()

context
  .add(exprs['s'], callables['s'])
  .add(exprs['k'], callables['k'])
  .add(exprs['i'], callables['i'])

describe('Recude', () => {
  test('i(:x) -> :x', () => {
    const expr = Expr.fromJSON({
      type: 'Apply',
      left: {
        type: 'Combinator',
        label: 'i',
      },
      right: {
        type: 'Symbol',
        label: 'x',
      },
    })

    expect(expr.reduce(context).toJSON())
      .toEqual({
        type: 'Symbol',
        label: 'x',
      })
  })

  test('(i(:x))(i(:y)) -> :x(i(:y)', () => {
    const expr = Expr.fromJSON({
      type: 'Apply',
      left : {
        type: 'Apply',
        left: {
          type: 'Combinator',
          label: 'i',
        },
        right: {
          type: 'Symbol',
          label: 'x',
        },
      },
      right: {
        type: 'Apply',
        left: {
          type: 'Combinator',
          label: 'i',
        },
        right: {
          type: 'Symbol',
          label: 'y',
        },
      },
    })

    expect(expr.reduce(context).toJSON())
      .toEqual({
        type: 'Apply',
        left : {
          type: 'Symbol',
          label: 'x',
        },
        right: {
          type: 'Apply',
          left: {
            type: 'Combinator',
            label: 'i',
          },
          right: {
            type: 'Symbol',
            label: 'y',
          },
        },
      })
  })

  test('k(:x, i(:y)) -> :x', () => {
    const expr = Expr.fromJSON({
      type: 'Apply',
      left : {
        type: 'Apply',
        left: {
          type: 'Combinator',
          label: 'k',
        },
        right: {
          type: 'Symbol',
          label: 'x',
        },
      },
      right: {
        type: 'Apply',
        left: {
          type: 'Combinator',
          label: 'i',
        },
        right: {
          type: 'Symbol',
          label: 'y',
        },
      },
    })

    expect(expr.reduce(context).toJSON())
      .toEqual({
        type: 'Symbol',
        label: 'x',
      })
  })

  test('s(:x, i(:y)) -> s(:x, :y)', () => {
    const expr = Expr.fromJSON({
      type: 'Apply',
      left : {
        type: 'Apply',
        left: {
          type: 'Combinator',
          label: 's',
        },
        right: {
          type: 'Symbol',
          label: 'x',
        },
      },
      right: {
        type: 'Apply',
        left: {
          type: 'Combinator',
          label: 'i',
        },
        right: {
          type: 'Symbol',
          label: 'y',
        },
      },
    })

    expect(expr.reduce(context).toJSON())
      .toEqual({
        type: 'Apply',
        left: {
          type: 'Apply',
          left: {
            type: 'Combinator',
            label: 's',
          },
          right: {
            type: 'Symbol',
            label: 'x',
          },
        },
        right: {
          type: 'Symbol',
          label: 'y',
        },
      })
  })
})
