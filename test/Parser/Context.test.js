const { Context } = require('../../dist/Context')
const { Combinator } = require('../../dist/Types/Expr')

const callables = require('./callables')

const combinators = Object.create(null)
combinators['s'] = new Combinator('s')
combinators['k'] = new Combinator('k')
combinators['i'] = new Combinator('i')
combinators['Y'] = new Combinator('Y')


describe('Context', () => {
  test('関数定義を追加', () => {
    const context = new Context()
    expect(context.size).toBe(0)
    expect(context.has(combinators['s'])).toBeFalsy()
    expect(context.has(combinators['k'])).toBeFalsy()
    expect(context.has(combinators['i'])).toBeFalsy()

    context.add(combinators['s'], callables['s'])
    expect(context.size).toBe(1)
    expect(context.has(combinators['s'])).toBeTruthy()
    expect(context.has(combinators['k'])).toBeFalsy()
    expect(context.has(combinators['i'])).toBeFalsy()

    context.add(combinators['k'], callables['k'])
    expect(context.size).toBe(2)
    expect(context.has(combinators['s'])).toBeTruthy()
    expect(context.has(combinators['k'])).toBeTruthy()
    expect(context.has(combinators['i'])).toBeFalsy()

    context.add(combinators['i'], callables['i'])
    expect(context.size).toBe(3)
    expect(context.has(combinators['s'])).toBeTruthy()
    expect(context.has(combinators['k'])).toBeTruthy()
    expect(context.has(combinators['i'])).toBeTruthy()
  })

  test('add() では同じ識別子で2回以上 関数定義を追加することはできない', () => {
    const context = new Context()

    context.add(combinators['s'], callables['s'])

    expect(() => { context.add(combinators['s'], callables['k']) })
      .toThrowError()
  })

  test('update() では同じ識別子で関数定義を追加できる', () => {
    const context = new Context()

    context.add(combinators['s'], callables['s'])

    expect(() => { context.update(combinators['s'], callables['k']) })
      .not.toThrowError()
  })

  test('追加したのと同じ関数定義を取り出せる', () => {
    const context = new Context()

    context
      .add(combinators['s'], callables['s'])
      .add(combinators['k'], callables['k'])
      .add(combinators['i'], callables['i'])

    expect(context.get(combinators['k']))
      .toEqual(callables['k'])
  })

  test('追加していない関数定義 (未定義の関数) を取り出そうとすると null が返る', () => {
    const context = new Context()

    context
      .add(combinators['s'], callables['s'])
      .add(combinators['k'], callables['k'])
      .add(combinators['i'], callables['i'])

    expect(context.get(combinators['Y']))
      .toBeNull()
  })
})
