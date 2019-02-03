const { Expr } = require('../../dist/Types/Expr')
const exprs = require('./exprs')

describe('Rewrite', () => {
  test('x(z)(y(z))[x=:A]', () => {
    expect(exprs['x(z)y(z))'].rewrite('x', exprs[':A']).toJSON())
      .toEqual({
        type: 'Apply',
        left: {
          type: 'Apply',
          left: {
            type: 'Symbol',
            label: 'A',
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
  })

  test('x(z)(y(z))[y=:B]', () => {
    expect(exprs['x(z)y(z))'].rewrite('y', exprs[':B']).toJSON())
      .toEqual({
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
            type: 'Symbol',
            label: 'B',
          },
          right: {
            type: 'Variable',
            label: 'z',
          },
        },
      })
  })

  test('x(z)(y(z))[z=:C]', () => {
    expect(exprs['x(z)y(z))'].rewrite('z', exprs[':C']).toJSON())
      .toEqual({
        type: 'Apply',
        left: {
          type: 'Apply',
          left: {
            type: 'Variable',
            label: 'x',
          },
          right: {
            type: 'Symbol',
            label: 'C',
          },
        },
        right: {
          type: 'Apply',
          left: {
            type: 'Variable',
            label: 'y',
          },
          right: {
            type: 'Symbol',
            label: 'C',
          },
        },
      })
  })
})
