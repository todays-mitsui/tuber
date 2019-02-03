const { Expr } = require('../../dist/Types/Expr')
const exprs = require('./exprs')

describe('FromJSON', () => {
  test('a', () => {
    expect(Expr.fromJSON({
      type: 'Combinator',
      label: 'a',
    })).toEqual(exprs['a'])
  })

  test(':A', () => {
    expect(Expr.fromJSON({
      type: 'Symbol',
      label: 'A',
    })).toEqual(exprs[':A'])
  })

  test('f(a)', () => {
    expect(Expr.fromJSON({
      type: 'Apply',
      left: {
        type: 'Combinator',
        label: 'f',
      },
      right: {
        type: 'Combinator',
        label: 'a',
      },
    })).toEqual(exprs['f(a)'])
  })

  test('x=>x', () => {
    expect(Expr.fromJSON({
      type: 'Lambda',
      param: 'x',
      body: {
        type: 'Variable',
        label: 'x',
      },
    })).toEqual(exprs['x=>x'])
  })

  test('x=>y=>z=>x(z)y(z))', () => {
    expect(Expr.fromJSON({
      type: 'Lambda',
      param: 'x',
      body: {
        type: 'Lambda',
        param: 'y',
        body: {
          type: 'Lambda',
          param: 'z',
          body: {
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
          },
        },
      },
    })).toEqual(exprs['x=>y=>z=>x(z)y(z))'])
  })
})
