const { Context } = require('../../dist/Context')
const { FromJSONContextLoader } = require('../../dist/ContextLoader/FromJSONContextLoader')
const { Combinator } = require('../../dist/Types/Expr')

const callables = require('../callables')

const combinators = Object.create(null)
combinators['s'] = new Combinator('s')
combinators['k'] = new Combinator('k')
combinators['i'] = new Combinator('i')
combinators['Y'] = new Combinator('Y')
combinators['foobar'] = new Combinator('foobar')

describe('FromJSONContextLoaderV1', () => {
  test('ContextLoader は Context を返す', () => {
    const json = require('../assets/TestContextV1.json')
    const loader = new FromJSONContextLoader(json)
    const context = loader.load()

    expect(context).toBeInstanceOf(Context)
  })

  test('TestContextV1 から s, k, i を読み出す', () => {
    const json = require('../assets/TestContextV1.json')
    const loader = new FromJSONContextLoader(json)
    const context = loader.load()

    expect(context.has(combinators['s']))
      .toBeTruthy()
    expect(context.get(combinators['s']))
      .toEqual(callables['s'])

    expect(context.has(combinators['k']))
      .toBeTruthy()
    expect(context.get(combinators['k']))
      .toEqual(callables['k'])

    expect(context.has(combinators['i']))
      .toBeTruthy()
    expect(context.get(combinators['i']))
      .toEqual(callables['i'])

    expect(context.has(combinators['foobar']))
      .toBeFalsy()
  })
})
