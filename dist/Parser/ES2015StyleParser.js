"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const P = require("parsimmon");
const immutable_1 = require("immutable");
const Expr_1 = require("../Types/Expr");
const Command_1 = require("../Types/Command");
const Callable_1 = require("../Types/Callable");
function token(parser) {
    return P.optWhitespace.then(parser).skip(P.optWhitespace);
}
function parens(parser) {
    return parser.trim(P.optWhitespace)
        .wrap(P.string('('), P.string(')'));
}
;
function optParens(parser) {
    return parens(parser).or(parser);
}
;
exports.ExprParser = P.createLanguage({
    expr(r) {
        return P.alt(r.lambda, r.applys);
    },
    // 関数適用
    applys(r) {
        return P.seqMap(r.callable, token(token(r.args).wrap(P.string('('), P.string(')'))).many(), (e1, argss) => (argss.reduce((e2, args) => (args.reduce((left, right) => (new Expr_1.Apply(left, right)), e2)), e1)));
    },
    // 呼び出し可能な式
    // -> 変数 | コンビネーター | シンボル | パーレンで囲まれた任意の式
    callable(r) {
        return P.alt(token(r.expr)
            .wrap(P.string('('), P.string(')'))
            .skip(P.optWhitespace), r.variable, r.symbl);
    },
    // 実引数
    args(r) {
        return P.sepBy1(
        /* content   = */ r.expr, 
        /* separator = */ token(P.string(',')));
    },
    // 関数抽象
    lambda(r) {
        return P.seqMap(token(optParens(r.params)), token(P.string('=>')), token(optParens(r.expr)), (params, _, body) => (params.reduceRight((body, param) => (new Expr_1.Lambda(param, body)), body)));
    },
    // 仮引数
    params(r) {
        return P.sepBy1(
        /* content   = */ r.identifier, 
        /* separator = */ token(P.string(',')));
    },
    // 変数
    variable(r) {
        return r.identifier
            .map(identifier => (new Expr_1.Variable(identifier)))
            .skip(P.optWhitespace);
    },
    // シンボル
    symbl(r) {
        return P.string(':').then(r.identifier)
            .map(identifier => (new Expr_1.Symbl(identifier)))
            .skip(P.optWhitespace);
    },
    // 識別子
    identifier() {
        return token(P.regex(/[a-zA-Z0-9_]+/));
    },
});
exports.CommandParser = P.createLanguage({
    command(r) {
        return P.alt(r.add, r.update, r.eval, r.evalLast, r.evalHead, r.evalTail, r.info, r.context);
    },
    // β変換列を表示
    eval() {
        return P.seqMap(token(exports.ExprParser.expr), P.eof, (expr, _) => (new Command_1.EvalCommand(expr)));
    },
    // β変結果のみ表示
    evalLast() {
        return P.seqMap(token(P.string('!')), token(exports.ExprParser.expr), P.eof, (_1, expr, _3) => (new Command_1.EvalLastCommand(expr)));
    },
    // β変換列の先頭のみ表示
    evalHead() {
        return P.seqMap(P.optWhitespace, P.string(':'), P.digits, P.whitespace, exports.ExprParser.expr, (_1, _2, numStr, _4, expr) => {
            const maxLength = parseInt(numStr, 10);
            return new Command_1.EvalHeadCommand(expr, maxLength);
        });
    },
    // β変換列の末尾のみ表示
    evalTail() {
        return P.seqMap(P.optWhitespace, P.string(':-'), P.digits, P.whitespace, exports.ExprParser.expr, (_1, _2, numStr, _4, expr) => {
            const maxLength = parseInt(numStr, 10);
            return new Command_1.EvalTailCommand(expr, maxLength);
        });
    },
    // 関数定義(定義済み関数の上書きを許さない)
    add(r) {
        return P.seqMap(token(r.lvalue), token(P.string(':=')), token(exports.ExprParser.expr), ([funcName, params], _, bareExpr) => (new Command_1.AddCommand(funcName, new Callable_1.Callable(params, bareExpr))));
    },
    // 関数定義(定義済み関数の上書きを許す)
    update(r) {
        return P.seqMap(token(r.lvalue), token(P.string('=')), token(exports.ExprParser.expr), ([funcName, params], _, bareExpr) => (new Command_1.UpdateCommand(funcName, new Callable_1.Callable(params, bareExpr))));
    },
    // 関数定義の左辺値
    lvalue() {
        return P.seqMap(token(exports.ExprParser.identifier), P.alt(parens(exports.ExprParser.params), P.succeed([])), (funcName, params) => {
            return [funcName, params];
        });
    },
    // Context から定義済み関数を検索する
    info() {
        return P.seqMap(token(P.string('?')), token(exports.ExprParser.identifier), P.eof, (_1, identifier, _3) => (new Command_1.InfoCommand(identifier)));
    },
    // Context 全体を参照
    context() {
        return P.seqMap(P.string('?'), P.optWhitespace, P.eof, () => (new Command_1.ContextCommand()));
    },
});
class ES2015StyleParser {
    constructor(exprParser, commandParser) {
        this.exprParser = exprParser;
        this.commandParser = commandParser;
        this.style = 'ES2015Style';
    }
    parseExpr(src) {
        const expr = this.exprParser.expr.tryParse(src);
        return this.allocate(immutable_1.Set(), expr);
    }
    parseCommand(src) {
        const command = this.commandParser.command.tryParse(src);
        if (false
            || command instanceof Command_1.EvalCommand
            || command instanceof Command_1.EvalLastCommand
            || command instanceof Command_1.EvalHeadCommand
            || command instanceof Command_1.EvalTailCommand) {
            return command.map(expr => this.allocate(immutable_1.Set(), expr));
        }
        if (false
            || command instanceof Command_1.AddCommand
            || command instanceof Command_1.UpdateCommand) {
            return command.map(callable => (new Callable_1.Callable(callable.params, this.allocate(immutable_1.Set(callable.params), callable.bareExpr))));
        }
        return command;
    }
    /**
     * Variable と Combinator の振り分けがされていない式に対して、正しく振り分けを行う
     *
     * @param set  いま着目している場所より外側の Lambda で登場した変数名を蓄積する集合
     * @param expr Variable と Combinator の振り分けがされる前の式
     */
    allocate(set, expr) {
        if (expr instanceof Expr_1.Variable) {
            if (set.has(expr.label)) {
                return expr;
            }
            return new Expr_1.Combinator(expr.label);
        }
        if (expr instanceof Expr_1.Combinator) {
            if (!set.has(expr.label)) {
                return expr;
            }
            return new Expr_1.Variable(expr.label);
        }
        if (expr instanceof Expr_1.Symbl) {
            return expr;
        }
        if (expr instanceof Expr_1.Apply) {
            return new Expr_1.Apply(this.allocate(set, expr.left), this.allocate(set, expr.right));
        }
        if (expr instanceof Expr_1.Lambda) {
            return new Expr_1.Lambda(expr.param, this.allocate(set.add(expr.param), expr.body));
        }
    }
}
exports.default = new ES2015StyleParser(exports.ExprParser, exports.CommandParser);
//# sourceMappingURL=ES2015StyleParser.js.map