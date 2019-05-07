import * as P from 'parsimmon'
import { Set } from 'immutable'

import { Parser } from '../Types/Parser'
import { Identifier, Expr, Variable, Combinator, Symbl, Lambda, Apply } from '../Types/Expr'
import {
    Command,
    EvalCommand,
    EvalLastCommand,
    EvalHeadCommand,
    EvalTailCommand,
    AddCommand,
    UpdateCommand,
    DeleteCommand,
    InfoCommand,
    ContextCommand,
} from '../Types/Command';
import { Callable } from '../Types/Callable';

export const CommentParser = P.createLanguage({
    comment(r): P.Parser<null> {
        return P.alt(
            r.singleLineComment,
            r.multilineComment
        ).many().then(P.succeed(null))
    },

    singleLineComment(): P.Parser<null> {
        return P.seq(
            P.optWhitespace,
            P.string('//'),
            P.regexp(/[^\n\r]*/),
            P.newline
        ).then(P.succeed(null))
    },

    multilineComment(): P.Parser<null> {
        return P.optWhitespace
            .then(P.regexp(/\/\*.*?\*\//))
            .then(P.succeed(null))
    },
})

function token (parser: P.Parser<any>): P.Parser<any> {
    return CommentParser.comment
        .then(P.optWhitespace)
        .then(parser)
        .skip(CommentParser.comment)
        .skip(P.optWhitespace)
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
                            (left, right) => ( new Apply(left, right) ),
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
            token(r.params),
            token(P.string('=>')),
            token(optParens(r.expr)),
            (params: Identifier[], _, body: Expr): Expr => (
                params.reduceRight(
                    (body, param) => ( new Lambda(param, body) ),
                    body
                )
            )
        )
    },

    // 仮引数
    params(r): P.Parser<Identifier[]> {
        return P.alt(
            optParens(r.identifier).map(param => [param]),
            parens(r.identifier.sepBy1(token(P.string(','))))
        )
    },

    // 変数
    variable(r): P.Parser<Variable> {
        return r.identifier
            .map(identifier => ( new Variable(identifier) ))
            .skip(P.optWhitespace)
    },

    // シンボル
    symbl(r): P.Parser<Symbl> {
        return P.string(':').then(r.identifier)
            .map(identifier => ( new Symbl(identifier) ))
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
            r.del,
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
            (expr: Expr, _) => ( new EvalCommand(expr) )
        )
    },

    // β変結果のみ表示
    evalLast(): P.Parser<Command> {
        return P.seqMap(
            token(P.string('!')),
            token(ExprParser.expr),
            P.eof,
            (_1, expr, _3) => ( new EvalLastCommand(expr) )
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
                const maxLength = parseInt(numStr, 10)

                return new EvalHeadCommand(expr, maxLength)
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
                const maxLength = parseInt(numStr, 10)

                return new EvalTailCommand(expr, maxLength)
            }
        )
    },

    // 関数定義(定義済み関数の上書きを許さない)
    add(r): P.Parser<Command> {
        return P.seqMap(
            token(r.lvalue),
            token(P.string(':=')),
            token(ExprParser.expr),
            ([funcName, params], _, bareExpr) => (
                new AddCommand(
                    funcName,
                    new Callable(params, bareExpr)
                )
            )
        )
    },

    // 関数定義(定義済み関数の上書きを許す)
    update(r): P.Parser<Command> {
        return P.seqMap(
            token(r.lvalue),
            token(P.string('=')),
            token(ExprParser.expr),
            ([funcName, params], _, bareExpr) => (
                new UpdateCommand(
                    funcName,
                    new Callable(params, bareExpr)
                )
            )
        )
    },

    del() {
        return token(ExprParser.identifier)
            .chain((identifier) => P.seqMap(
                token(P.string('=')),
                P.string(identifier),
                (_1, _2) => (
                    new DeleteCommand(identifier)
                )
            ))
    },

    // 関数定義の左辺値
    lvalue(): P.Parser<[Identifier,Identifier[]]> {
        return P.seqMap(
            token(ExprParser.identifier),
            P.alt(
                parens(ExprParser.identifier.sepBy1(token(P.string(',')))),
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
            (_1, identifier, _3) => ( new InfoCommand(identifier) )
        )
    },

    // Context 全体を参照
    context(): P.Parser<Command> {
        return P.seqMap(
            P.string('?'),
            P.optWhitespace,
            P.eof,
            () => ( new ContextCommand() )
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

        if (
            false
            || command instanceof EvalCommand
            || command instanceof EvalLastCommand
            || command instanceof EvalHeadCommand
            || command instanceof EvalTailCommand
        ) {
            return command.map(expr => this.allocate(Set(), expr))
        }

        if (
            false
            || command instanceof AddCommand
            || command instanceof UpdateCommand
        ) {
            return command.map(callable => (
                new Callable(
                    callable.params,
                    this.allocate(
                        Set(callable.params),
                        callable.bareExpr
                    )
                )
            ))
        }

        return command
    }

    /**
     * Variable と Combinator の振り分けがされていない式に対して、正しく振り分けを行う
     *
     * @param set  いま着目している場所より外側の Lambda で登場した変数名を蓄積する集合
     * @param expr Variable と Combinator の振り分けがされる前の式
     */
    private allocate(set: Set<Identifier>, expr: Expr): Expr {
        if (expr instanceof Variable) {
            if (set.has(expr.label)) { return expr }

            return new Combinator(expr.label)
        }

        if (expr instanceof Combinator) {
            if (!set.has(expr.label)) { return expr }

            return new Variable(expr.label)
        }

        if (expr instanceof Symbl) {
            return expr
        }

        if (expr instanceof Apply) {
            return new Apply(
                this.allocate(set, expr.left),
                this.allocate(set, expr.right)
            )
        }

        if (expr instanceof Lambda) {
            return new Lambda(
                expr.param,
                this.allocate(set.add(expr.param), expr.body)
            )
        }
    }
}

export default new ES2015StyleParser(ExprParser, CommandParser)
