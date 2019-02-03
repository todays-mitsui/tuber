const { Variable, Combinator, Symbl, Lambda, Apply } = require('../../dist/Types/Expr')

const exprs = Object.create(null)

exprs['x']    = new Variable('x')
exprs['y']    = new Variable('y')
exprs['z']    = new Variable('z')
exprs['f']    = new Combinator('f')
exprs['a']    = new Combinator('a')
exprs[':A']   = new Symbl('A')
exprs[':B']   = new Symbl('B')
exprs[':C']   = new Symbl('C')
exprs['f(a)'] = new Apply(exprs['f'], exprs['a'])
exprs['x=>x'] = new Lambda('x', exprs['x'])
exprs['x=>y'] = new Lambda('x', exprs['y'])
exprs['x(z)y(z))'] = new Apply(
  new Apply(exprs['x'], exprs['z']),
  new Apply(exprs['y'], exprs['z'])
)
exprs['x=>y=>z=>x(z)y(z))'] = new Lambda(
  'x',
  new Lambda(
    'y',
    new Lambda(
      'z',
      exprs['x(z)y(z))']
    )
  )
)

module.exports = exprs
