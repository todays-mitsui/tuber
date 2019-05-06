const { Calculator } = require('../dist/Calculator')
const { FromJSONContextLoader } = require('../dist/ContextLoader/FromJSONContextLoader')
const { EmptyContextLoader } = require('../dist/ContextLoader/EmptyContextLoader')
const { ContextDumperV2 } = require('../dist/ContextDumper/ContextDumperV2')
const { Lambda, Apply } = require('../dist/Types/Expr')
const exprs = require('./exprs')

const app = (left, right) => ( new Apply(left, right) )


describe('Calculator', () => {
  test('s(k, k)(:A) -> :A', () => {
    const json = require('./assets/TestContextV1.json')
    const loader = new FromJSONContextLoader(json)

    const calculator = new Calculator({ loader })

    const s = exprs['s']
    const k = exprs['k']
    const skk = app(app(s, k), k)

    const A = exprs[':A']
    const skkA = app(skk, A)
    const kAkA = app(app(k, A), app(k, A))

    const { sequence, step, done } = calculator.eval(skkA)

    expect(sequence).toEqual([skkA, kAkA, A])
    expect(done).toBeTruthy()
  })

  test('(x=>(x(x)))(x=>(x(x))) は停止しないためβ簡約列は打ち切られる', () => {
    const loader = new EmptyContextLoader()
    const calculator = new Calculator({ loader })

    const x = exprs['x']
    const f = new Lambda('x', app(x, x))
    const ff = app(f, f)

    expect(calculator.next).toBeNull()

    const { sequence, step, done } = calculator.eval(ff)

    expect(sequence).toHaveLength(100)
    expect(done).toBeFalsy()

    expect(calculator.next).not.toBeNull()
  })

  test('停止しない簡約のβ簡約列の長さは chunk よって指定できる', () => {
    const chunkLength = 42

    const loader = new EmptyContextLoader()
    const calculator = new Calculator({ loader, chunkLength })

    const x = exprs['x']
    const f = new Lambda('x', app(x, x))
    const ff = app(f, f)

    const { sequence, step, done } = calculator.eval(ff)

    expect(sequence).toHaveLength(chunkLength)
    expect(done).toBeFalsy()
  })
})

describe('Calculator.prototype.dumpContext', () => {
  test('dumpContext で現在の context を JSON シリアライズ可能な形式に変換する', () => {
    const json = require('./assets/TestContextV1.json')
    const loader = new FromJSONContextLoader(json)

    const dumper = new ContextDumperV2()

    const calculator = new Calculator({ loader, dumper })

    expect(calculator.dumpContext()).toEqual({
      version: '2.0',
      context: [
        {
          N: 's',
          P: ['x', 'y', 'z'],
          E: {
            L: { L: { V: 'x' }, R: { V: 'z' } },
            R: { L: { V: 'y' }, R: { V: 'z' } },
          },
        },
        {
          N: 'k',
          P: ['x', 'y'],
          E: { V: 'x' },
        },
        {
          N: 'i',
          P: ['x'],
          E: { V: 'x' },
        },
        {
          N: 'true',
          P: [],
          E: { P: 'x', E: { P: 'y', E: { V: 'x' } } },
        },
        {
          N: 'false',
          P: [],
          E: { P: 'x', E: { P: 'y', E: { V: 'y' } } },
        },
      ]
    })
  })

  test('dumpContext したデータを再び FromJSONContextLoader で読ませると等値になる', () => {
    const json1 = require('./assets/TestContextV2.json')
    const loader1 = new FromJSONContextLoader(json1)
    const dumper1 = new ContextDumperV2()
    const calculator1 = new Calculator({ loader: loader1, dumper: dumper1 })

    const dumpedContext = calculator1.dumpContext()

    const loader2 = new FromJSONContextLoader(dumpedContext)
    const calculator2 = new Calculator({ loader: loader2 })

    expect(calculator1.context).toEqual(calculator2.context)
  })
})
