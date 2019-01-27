import * as P from 'parsimmon'
import { Set } from 'immutable'

import { Parser } from '../Types/Parser'
import { Variable, Symbl, Identifier, Expr } from '../Types/Expr'
import { Command, Action } from '../Types/Command';


function token (parser: P.Parser<any>): P.Parser<any> {
    return P.optWhitespace.then(parser).skip(P.optWhitespace)
}

function parens (parser: P.Parser<any>): P.Parser<any> {
    return parser.trim(P.optWhitespace)
        .wrap(P.string('('), P.string(')'))
};

function optParens (parser: P.Parser<any>): P.Parser<any> {
    return parens(parser).or(parser)
};


export const ExprParser = P.createLanguage({
    expr(r): P.Parser<Expr> {
        return P.alt(
            r.lambda,
            r.applys,
        )
    },

    // 関数適用
    applys(r): P.Parser<Expr> {
        return P.seqMap(
            r.callable,
            token(token(r.args).wrap(P.string('('), P.string(')'))).many(),
            (e1: Expr, argss: Expr[][]) => (
                argss.reduce(
                    (e2: Expr, args: Expr[]) => (
                        args.reduce(
                            (left, right) => ({
                                type: 'Apply' as 'Apply',
                                left,
                                right
                            }),
                            e2
                        )
                    ),
                    e1
                )
            )
        )
    },

    // 呼び出し可能な式
    // -> 変数 | コンビネーター | シンボル | パーレンで囲まれた任意の式
    callable(r): P.Parser<Expr> {
        return P.alt(
            token(r.expr)
                .wrap(P.string('('), P.string(')'))
                .skip(P.optWhitespace)
            ,
            r.variable,
            r.symbl
        )
    },

    // 実引数
    args(r): P.Parser<Expr[]> {
        return P.sepBy1(
            /* content   = */ r.expr,
            /* separator = */ token(P.string(','))
        )
    },

    // 関数抽象
    lambda(r): P.Parser<Expr> {
        return P.seqMap(
            token(optParens(r.params)),
            token(P.string('=>')),
            token(optParens(r.expr)),
            (params: Identifier[], _, body: Expr): Expr => (
                params.reduceRight(
                    (body: Expr, param: Identifier) => ({
                        type: 'Lambda' as 'Lambda',
                        param,
                        body
                    }),
                    body
                )
            )
        )
    },

    // 仮引数
    params(r): P.Parser<Identifier[]> {
        return P.sepBy1(
            /* content   = */ r.identifier,
            /* separator = */ token(P.string(','))
        )
    },

    // 変数
    variable(r): P.Parser<Variable> {
        return r.identifier
            .map(identifier => ({
                type: 'Variable' as 'Variable',
                label: identifier,
            }))
            .skip(P.optWhitespace)
    },

    // シンボル
    symbl(r): P.Parser<Symbl> {
        return P.string(':').then(r.identifier)
            .map(identifier => ({
                type: 'Symbol' as 'Symbol',
                label: identifier,
            }))
            .skip(P.optWhitespace)
    },

    // 識別子
    identifier(): P.Parser<Identifier> {
        return token(P.regex(/[a-zA-Z0-9_]+/))
    },
})

export const CommandParser = P.createLanguage({
    command(r): P.Parser<Command> {
        return P.alt(
            r.add,
            r.update,
            r.eval,
            r.evalLast,
            r.evalHead,
            r.evalTail,
            r.info,
            r.context
        )
    },

    // β変換列を表示
    eval(): P.Parser<Command> {
        return P.seqMap(
            token(ExprParser.expr),
            P.eof,
            (expr: Expr, _) => {
                return {
                    action: Action.Eval,
                    operand: {
                        expr,
                    },
                }
            }
        )
    },

    // β変結果のみ表示
    evalLast(): P.Parser<Command> {
        return P.seqMap(
            token(P.string('!')),
            token(ExprParser.expr),
            P.eof,
            (_1, expr, _3) => {
                return {
                    action: Action.EvalLast,
                    operand: {
                        expr,
                    }
                }
            }
        )
    },

    // β変換列の先頭のみ表示
    evalHead(): P.Parser<Command> {
        return P.seqMap(
            P.optWhitespace,
            P.string(':'),
            P.digits,
            P.whitespace,
            ExprParser.expr,
            (_1, _2, numStr, _4, expr) => {
                return {
                    action: Action.EvalHead,
                    operand: {
                        expr,
                        length: parseInt(numStr, 10),
                    },
                }
            }
        )
    },

    // β変換列の末尾のみ表示
    evalTail(): P.Parser<Command> {
        return P.seqMap(
            P.optWhitespace,
            P.string(':-'),
            P.digits,
            P.whitespace,
            ExprParser.expr,
            (_1, _2, numStr, _4, expr) => {
                return {
                    action: Action.EvalTail,
                    operand: {
                        expr,
                        length: parseInt(numStr, 10),
                    },
                }
            }
        )
    },

    // 関数定義(定義済み関数の上書きを許さない)
    add(r): P.Parser<Command> {
        return P.seqMap(
            token(r.lvalue),
            token(P.string(':=')),
            token(ExprParser.expr),
            ([funcName, params], _, bareExpr) => {
                return {
                    action: Action.Add,
                    operand: {
                        identifier: funcName,
                        callable: {
                            params,
                            bareExpr
                        },
                    }
                }
            }
        )
    },

    // 関数定義(定義済み関数の上書きを許す)
    update(r): P.Parser<Command> {
        return P.seqMap(
            token(r.lvalue),
            token(P.string('=')),
            token(ExprParser.expr),
            ([funcName, params], _, bareExpr) => {
                return {
                    action: Action.Update,
                    operand: {
                        identifier: funcName,
                        callable: {
                            params,
                            bareExpr
                        },
                    }
                }
            }
        )
    },

    // 関数定義の左辺値
    lvalue(): P.Parser<[Identifier,Identifier[]]> {
        return P.seqMap(
            token(ExprParser.identifier),
            P.alt(
                parens(ExprParser.params),
                P.succeed([])
            ),
            (funcName, params): [Identifier, Identifier[]] => {
                return [funcName, params]
            }
        )
    },

    // Context から定義済み関数を検索する
    info(): P.Parser<Command> {
        return P.seqMap(
            token(P.string('?')),
            token(ExprParser.identifier),
            P.eof,
            (_1, identifier, _3) => {
                return {
                    action: Action.Info,
                    operand: {
                        identifier,
                    }
                }
            }
        )
    },

    // Context 全体を参照
    context(): P.Parser<Command> {
        return P.seqMap(
            P.string('?'),
            P.optWhitespace,
            P.eof,
            () => {
                return {
                    action: Action.Context,
                }
            }
        )
    },
})

class ES2015StyleParser implements Parser {
    public style: string

    constructor(
        private exprParser: P.Language,
        private commandParser: P.Language
    ) {
        this.style = 'ES2015Style'
    }

    public parseExpr(src: string): Expr {
        const expr = this.exprParser.expr.tryParse(src)

        return this.allocate(Set(), expr)
    }

    public parseCommand(src: string): Command {
        const command = this.commandParser.command.tryParse(src)

        switch (command.action) {
            case Action.Eval:
            case Action.EvalLast:
            case Action.EvalHead:
            case Action.EvalTail:
            {
                command.operand.expr = this.allocate(Set(), command.operand.expr)

                return command
            }

            case Action.Add:
            case Action.Update:
            {
                command.operand.callable.bareExpr = this.allocate(
                    Set(command.operand.callable.params),
                    command.operand.callable.bareExpr
                )

                return command
            }

            default: {
                return command
            }
        }
    }

    /**
     * Variable と Combinator の振り分けがされていない式に対して、正しく振り分けを行う
     *
     * @param set  いま着目している場所より外側の Lambda で登場した変数名を蓄積する集合
     * @param expr Variable と Combinator の振り分けがされる前の式
     */
    private allocate(set: Set<Identifier>, expr: Expr): Expr {
        switch (expr.type) {
            case 'Variable': {
                if (set.has(expr.label)) { return expr }

                return {
                    type: 'Combinator',
                    label: expr.label,
                }
            }

            case 'Combinator': {
                if (!set.has(expr.label)) { return expr }

                return {
                    type: 'Variable',
                    label: expr.label,
                }
            }

            case 'Symbol': {
                return expr
            }

            case 'Apply': {
                return {
                    type: 'Apply',
                    left: this.allocate(set, expr.left),
                    right: this.allocate(set, expr.right),
                }
            }

            case 'Lambda': {
                return {
                    type: 'Lambda',
                    param: expr.param,
                    body: this.allocate(set.add(expr.param), expr.body),
                }
            }
        }
    }
}

export default new ES2015StyleParser(ExprParser, CommandParser)
