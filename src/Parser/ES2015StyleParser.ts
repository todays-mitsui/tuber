import * as P from 'parsimmon'

import { Variable, Symbl, Identifier, Expr, Lambda } from '../Types'


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


export const Parser = P.createLanguage({
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
            token(r.args).wrap(P.string('('), P.string(')')).many(),
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
    lambda(r) {
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
    params(r) {
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


    namedFunc(r) {
        return seqMap(
            P.string('function'),
            P.whitespace,
            r.identifier,
            token(parens(r.params)),
            

    },

    // 関数定義(定義済み関数の上書きを許さない)
    addFunc(r) {
        return P.seqMap(
            token(r.identifier),
            token(P.string(':=')),
            token(r.expr),
            ([funcName, params], _, bareExpr) => ( [funcName, new Func(params, bareExpr)] )
        )
    },
})
