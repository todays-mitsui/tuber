const { Expr } = require('../../dist/Types/Expr')
const { Context } = require('../../dist/Context')

const exprs = require('./exprs')
const callables = require('./callables')

const context = new Context()

context
  .add(exprs['s'], callables['s'])
  .add(exprs['k'], callables['k'])
  .add(exprs['i'], callables['i'])

describe('Reduce', () => {
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

  test('(x=>x)(:A) -> :A', () => {
    const expr = Expr.fromJSON({
      type: 'Apply',
      left: {
        type: 'Lambda',
        param: 'x',
        body: {
          type: 'Variable',
          label: 'x',
        },
      },
      right: {
        type: 'Symbol',
        label: 'A',
      },
    })

    expect(expr.reduce(context).toJSON())
      .toEqual({
        type: 'Symbol',
        label: 'A',
      })
  })

  test('(x=>y=>y(x))(:A) -> y=>y(:A)', () => {
    const expr = Expr.fromJSON({
      type: 'Apply',
      left: {
        type: 'Lambda',
        param: 'x',
        body: {
          type: 'Lambda',
          param: 'y',
          body: {
            type: 'Apply',
            left: {
              type: 'Variable',
              label: 'x',
            },
            right: {
              type: 'Variable',
              label: 'y',
            },
          },
        },
      },
      right: {
        type: 'Symbol',
        label: 'A',
      },
    })

    expect(expr.reduce(context).toJSON())
      .toEqual({
        type: 'Lambda',
        param: 'y',
        body: {
          type: 'Apply',
          left: {
            type: 'Symbol',
            label: 'A',
          },
          right: {
            type: 'Variable',
            label: 'y',
          },
        },
      })
  })
})
