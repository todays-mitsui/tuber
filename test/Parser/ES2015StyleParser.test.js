const parser = require('../../dist/Parser/ES2015StyleParser').default
const ExprParser = require('../../dist/Parser/ES2015StyleParser').ExprParser
const CommandParser = require('../../dist/Parser/ES2015StyleParser').CommandParser


describe('ES2015StyleExprParser', () => {
  describe('変数のパーズ', () => {
    test('1文字変数のパーズ "x"', () => {
      expect(ExprParser.variable.tryParse('x'))
        .toEqual({
          type: 'Variable',
          label: 'x',
        })
    })

    test('1文字変数のパーズ "X"', () => {
      expect(ExprParser.variable.tryParse('X'))
        .toEqual({
          type: 'Variable',
          label: 'X',
        })
    })

    test('1文字変数のパーズ "_"', () => {
      expect(ExprParser.variable.tryParse('_'))
        .toEqual({
          type: 'Variable',
          label: '_',
        })
    })

    test('1文字変数のパーズ "0"', () => {
      expect(ExprParser.variable.tryParse('0'))
        .toEqual({
          type: 'Variable',
          label: '0',
        })
    })

    test('複数文字変数のパーズ "add"', function() {
      expect(ExprParser.variable.tryParse('add'))
        .toEqual({
          type: 'Variable',
          label: 'add',
        })
    })

    test('複数文字変数のパーズ "FooBar2000"', function() {
      expect(ExprParser.variable.tryParse('FooBar2000'))
        .toEqual({
          type: 'Variable',
          label: 'FooBar2000',
        })
    })
  })

  describe('シンボルのパーズ', () => {
    test('1文字シンボルのパーズ ":y"', () => {
      expect(ExprParser.symbl.tryParse(':y'))
        .toEqual({
          type: 'Symbol',
          label: 'y',
        })
    })

    test('1文字シンボルのパーズ ":Y"', () => {
      expect(ExprParser.symbl.tryParse(':Y'))
        .toEqual({
          type: 'Symbol',
          label: 'Y',
        })
    })

    test('1文字シンボルのパーズ ":_"', () => {
      expect(ExprParser.symbl.tryParse(':_'))
        .toEqual({
          type: 'Symbol',
          label: '_',
        })
    })

    test('1文字シンボルのパーズ ":Y"', () => {
      expect(ExprParser.symbl.tryParse(':1'))
        .toEqual({
          type: 'Symbol',
          label: '1',
        })
    })

    test('複数文字シンボルのパーズ ":sub"', () => {
      expect(ExprParser.symbl.tryParse(':sub'))
        .toEqual({
          type: 'Symbol',
          label: 'sub',
        })
    })

    test('複数文字シンボルのパーズ ":NP"', () => {
      expect(ExprParser.symbl.tryParse(':NP'))
        .toEqual({
          type: 'Symbol',
          label: 'NP',
        })
    })

    test('シンボルは ":" から始まっていなければいけない', () => {
      expect(() => { ExprParser.symbl.tryParse('x') })
        .toThrowError()
    })
  })

  describe('関数抽象のパーズ', () => {
    test('基本形 "(x) => (x)"', () => {
      expect(ExprParser.lambda.tryParse('(x) => (x)'))
        .toEqual({
          type: 'Lambda',
          param: 'x',
          body: {
            type: 'Variable',
            label: 'x',
          }
        })
    })

    test('多変数関数 "(x, y) => (y)"', () => {
      expect(ExprParser.lambda.tryParse('(x, y) => (y)'))
        .toEqual({
          type: 'Lambda',
          param: 'x',
          body: {
            type: 'Lambda',
            param: 'y',
            body: {
              type: 'Variable',
              label: 'y',
            }
          }
        })
    })

    test('関数本体には任意の式が書ける "(x, y) => (y(x, :a))"', () => {
      expect(ExprParser.lambda.tryParse('(x, y) => (y(x, :a))'))
        .toEqual({
          type: 'Lambda',
          param: 'x',
          body: {
            type: 'Lambda',
            param: 'y',
            body: {
              type: 'Apply',
              left: {
                type: 'Apply',
                left: {
                  type: 'Variable',
                  label: 'y'
                },
                right: {
                  type: 'Variable',
                  label: 'x'
                }
              },
              right: {
                type: 'Symbol',
                label: 'a'
              }
            }
          }
        })
    })

    test('仮引数の括弧は省略可能 "x, y => (y)"', () => {
      expect(ExprParser.lambda.tryParse('x, y => (y)'))
        .toEqual({
          type: 'Lambda',
          param: 'x',
          body: {
            type: 'Lambda',
            param: 'y',
            body: {
              type: 'Variable',
              label: 'y',
            }
          }
        })
    })

    test('関数本体の括弧は省略可能 "(x, y) => y(x, :a)"', () => {
      expect(ExprParser.lambda.tryParse('(x, y) => y(x, :a)'))
        .toEqual({
          type: 'Lambda',
          param: 'x',
          body: {
            type: 'Lambda',
            param: 'y',
            body: {
              type: 'Apply',
              left: {
                type: 'Apply',
                left: {
                  type: 'Variable',
                  label: 'y'
                },
                right: {
                  type: 'Variable',
                  label: 'x'
                }
              },
              right: {
                type: 'Symbol',
                label: 'a'
              }
            }
          }
        })
    })
  })

  describe('関数適用のパーズ', () => {
    test('基本形 "x(a)"', () => {
      expect(ExprParser.applys.tryParse('x(a)'))
        .toEqual({
          type: 'Apply',
          left: {
            type: 'Variable',
            label: 'x',
          },
          right: {
            type: 'Variable',
            label: 'a',
          }
        })
    })

    test('複数の引数を一度に適用できる "x(a, b)"', () => {
      expect(ExprParser.applys.tryParse('x(a, b)'))
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
              label: 'a',
            },
          },
          right: {
            type: 'Variable',
            label: 'b',
          },
        })
    })

    test('関数適用は標準でカリー化される "x(a)(b)"', () => {
      expect(ExprParser.applys.tryParse('x(a)(b)'))
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
              label: 'a',
            },
          },
          right: {
            type: 'Variable',
            label: 'b',
          },
        })
    })

    test('任意の式に任意の式を適用できる "(x, y => y)(:a)"', () => {
      expect(ExprParser.applys.tryParse('(x, y => y)(:a)'))
        .toEqual({
          type: 'Apply',
          left: {
            type: 'Lambda',
            param: 'x',
            body: {
              type: 'Lambda',
              param: 'y',
              body: {
                type: 'Variable',
                label: 'y',
              },
            },
          },
          right: {
            type: 'Symbol',
            label: 'a',
          },
        })
    })

    test('シンボルに式を適用することもできる ":f(x)"', () => {
      expect(ExprParser.applys.tryParse(':f(x)'))
        .toEqual({
          type: 'Apply',
          left: {
            type: 'Symbol',
            label: 'f',
          },
          right: {
            type: 'Variable',
            label: 'x',
          },
        })
    })
  })

  describe('式のパーズ', () => {
    test('(x, y, z) => x(z, y(z))', () => {
      expect(ExprParser.expr.tryParse('(x, y, z) => x(z, y(z))'))
        .toEqual({
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
        })
    })

    test('x, y, z => x (z) (y (z))', () => {
      expect(ExprParser.expr.tryParse('x, y, z => x (z) (y (z))'))
        .toEqual({
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
        })
    })
  })
})

describe('ES2015StyleCommandParser', () => {
  describe('関数定義のパーズ', () => {
    test('flip(f) = x => y => f(y, x)', () => {
      expect(CommandParser.update.tryParse('flip(f) = x => y => f(y, x)'))
        .toEqual({
          action: 'Update',
          operand: {
            identifier: 'flip',
            callable: {
              params: ['f'],
              bareExpr: {
                type: 'Lambda',
                param: 'x',
                body: {
                  type: 'Lambda',
                  param: 'y',
                  body: {
                    type: 'Apply',
                    left: {
                      type: 'Apply',
                      left: {
                        type: 'Variable',
                        label: 'f',
                      },
                      right: {
                        type: 'Variable',
                        label: 'y',
                      },
                    },
                    right: {
                      type: 'Variable',
                      label: 'x',
                    }
                  }
                }
              }
            }
          },
        })
    })

    test('引数を取らない関数(コンビネーター)の場合、左辺値のパーレンを省略しなければいけない', () => {
      expect(() => { CommandParser.update.tryParse('true() = x => y => x') })
        .toThrowError()

      expect(CommandParser.update.tryParse('true = x => y => x'))
        .toEqual({
          action: 'Update',
          operand: {
            identifier: 'true',
            callable: {
              params: [],
              bareExpr: {
                type: 'Lambda',
                param: 'x',
                body: {
                  type: 'Lambda',
                  param: 'y',
                  body: {
                    type: 'Variable',
                    label: 'x',
                  },
                },
              },
            },
          }
        })
    })

    test('s(x,y,z)=x(z)(y(z))', () => {
      expect(CommandParser.update.tryParse('s(x,y,z)=x(z)(y(z))'))
        .toEqual({
          action: 'Update',
          operand: {
            identifier: 's',
            callable: {
              params: ['x', 'y', 'z'],
              bareExpr: {
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
              }
            },
          }
        })
    })
  })
})

describe('ES2015StyleParser', () => {
  describe('parseExpr', () => {
    test('自由変数と束縛変数の混ざった式', () => {
      expect(parser.parseExpr('x => Y( x(x) )'))
        .toEqual({
          type: 'Lambda',
          param: 'x',
          body: {
            type: 'Apply',
            left: {
              type: 'Combinator',
              label: 'Y',
            },
            right: {
              type: 'Apply',
              left: {
                type: 'Variable',
                label: 'x',
              },
              right: {
                type: 'Variable',
                label: 'x',
              },
            }
          }
        })
    })
  })

  describe('parseCommand', () => {
    test('自由変数と束縛変数の混ざった関数定義', () => {
      expect(parser.parseCommand('Y(x) := x(Y(x))'))
        .toEqual({
          action: 'Add',
          operand: {
            identifier: 'Y',
            callable: {
              params: ['x'],
              bareExpr: {
                type: 'Apply',
                left: {
                  type: 'Variable',
                  label: 'x',
                },
                right: {
                  type: 'Apply',
                  left: {
                    type: 'Combinator',
                    label: 'Y',
                  },
                  right: {
                    type: 'Variable',
                    label: 'x',
                  },
                }
              }
            },
          }
        })
    })
  })
})
