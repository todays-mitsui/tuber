const { Context } = require('../../dist/Context')
const { ContextLoaderFromJSON } = require('../../dist/ContextLoader/ContextLoaderFromJSON')
const { Combinator } = require('../../dist/Types/Expr')

const callables = require('../callables')

const combinators = Object.create(null)
combinators['s'] = new Combinator('s')
combinators['k'] = new Combinator('k')
combinators['i'] = new Combinator('i')
combinators['Y'] = new Combinator('Y')

describe('ContextLoaderFromJSON', () => {
  test('ContextLoader は Context を返す', () => {
    const filepath = '../../assets/DefaultContext.json'
    const loader = new ContextLoaderFromJSON(filepath)
    const context = loader.load()

    expect(context).toBeInstanceOf(Context)
  })

  test('DefaultContext から s, k, i を読み出す', () => {
    const filepath = '../../assets/DefaultContext.json'
    const loader = new ContextLoaderFromJSON(filepath)
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
  })
})
