const { Calculator } = require('../dist/Calculator')
const { FromJSONContextLoader } = require('../dist/ContextLoader/FromJSONContextLoader')
const { EmptyContextLoader } = require('../dist/ContextLoader/EmptyContextLoader')
const { Lambda, Apply } = require('../dist/Types/Expr')
const exprs = require('./exprs')

const app = (left, right) => ( new Apply(left, right) )


describe('Calculator', () => {
  test('s(k, k)(:A) -> :A', () => {
    const filepath = '../../assets/DefaultContext.json'
    const loader = new FromJSONContextLoader(filepath)

    const calculator = new Calculator(loader)

    const s = exprs['s']
    const k = exprs['k']
    const skk = app(app(s, k), k)

    const A = exprs[':A']
    const skkA = app(skk, A)
    const kAkA = app(app(k, A), app(k, A))

    expect(calculator.eval(skkA))
      .toEqual([skkA, kAkA, A])
  })

  test('(x=>(x(x)))(x=>(x(x))) は停止しないためβ簡約列は打ち切られる', () => {
    const loader = new EmptyContextLoader()
    const calculator = new Calculator(loader)

    const x = exprs['x']
    const f = new Lambda('x', app(x, x))
    const ff = app(f, f)

    expect(calculator.next).toBeNull()
    expect(calculator.eval(ff)).toHaveLength(100)
    expect(calculator.next).not.toBeNull()
  })

  test('停止しない簡約のβ簡約列の長さは chunk よって指定できる', () => {
    const chunk = 42

    const loader = new EmptyContextLoader()
    const calculator = new Calculator(loader, chunk)

    const x = exprs['x']
    const f = new Lambda('x', app(x, x))
    const ff = app(f, f)

    expect(calculator.next).toBeNull()
    expect(calculator.eval(ff)).toHaveLength(chunk)
    expect(calculator.next).not.toBeNull()
  })
})