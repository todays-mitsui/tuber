"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const P = require("parsimmon");
const Command_1 = require("../Types/Command");
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
        return P.seqMap(r.callable, token(token(r.args).wrap(P.string('('), P.string(')'))).many(), (e1, argss) => (argss.reduce((e2, args) => (args.reduce((left, right) => ({
            type: 'Apply',
            left,
            right
        }), e2)), e1)));
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
        return P.seqMap(token(optParens(r.params)), token(P.string('=>')), token(optParens(r.expr)), (params, _, body) => (params.reduceRight((body, param) => ({
            type: 'Lambda',
            param,
            body
        }), body)));
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
            .map(identifier => ({
            type: 'Variable',
            label: identifier,
        }))
            .skip(P.optWhitespace);
    },
    // シンボル
    symbl(r) {
        return P.string(':').then(r.identifier)
            .map(identifier => ({
            type: 'Symbol',
            label: identifier,
        }))
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
        return P.seqMap(token(exports.ExprParser.expr), P.eof, (expr, _) => {
            return {
                action: Command_1.Action.Eval,
                operand: {
                    expr,
                },
            };
        });
    },
    // β変結果のみ表示
    evalLast() {
        return P.seqMap(token(P.string('!')), token(exports.ExprParser.expr), P.eof, (_1, expr, _3) => {
            return {
                action: Command_1.Action.EvalLast,
                operand: {
                    expr,
                }
            };
        });
    },
    // β変換列の先頭のみ表示
    evalHead() {
        return P.seqMap(P.optWhitespace, P.string(':'), P.digits, P.whitespace, exports.ExprParser.expr, (_1, _2, numStr, _4, expr) => {
            return {
                action: Command_1.Action.EvalHead,
                operand: {
                    expr,
                    length: parseInt(numStr, 10),
                },
            };
        });
    },
    // β変換列の末尾のみ表示
    evalTail() {
        return P.seqMap(P.optWhitespace, P.string(':-'), P.digits, P.whitespace, exports.ExprParser.expr, (_1, _2, numStr, _4, expr) => {
            return {
                action: Command_1.Action.EvalTail,
                operand: {
                    expr,
                    length: parseInt(numStr, 10),
                },
            };
        });
    },
    // 関数定義(定義済み関数の上書きを許さない)
    add(r) {
        return P.seqMap(token(r.lvalue), token(P.string(':=')), token(exports.ExprParser.expr), ([funcName, params], _, bareExpr) => {
            return {
                action: Command_1.Action.Add,
                operand: {
                    identifier: funcName,
                    func: {
                        params,
                        bareExpr
                    },
                }
            };
        });
    },
    // 関数定義(定義済み関数の上書きを許す)
    update(r) {
        return P.seqMap(token(r.lvalue), token(P.string('=')), token(exports.ExprParser.expr), ([funcName, params], _, bareExpr) => {
            return {
                action: Command_1.Action.Update,
                operand: {
                    identifier: funcName,
                    func: {
                        params,
                        bareExpr
                    },
                }
            };
        });
    },
    // 関数定義の左辺値
    lvalue() {
        return P.seqMap(token(exports.ExprParser.identifier), P.alt(parens(exports.ExprParser.params), P.succeed([])), (funcName, params) => {
            return [funcName, params];
        });
    },
    // Context から定義済み関数を検索する
    info() {
        return P.seqMap(token(P.string('?')), token(exports.ExprParser.identifier), P.eof, (_1, identifier, _3) => {
            return {
                action: Command_1.Action.Info,
                operand: {
                    identifier,
                }
            };
        });
    },
    // Context 全体を参照
    context() {
        return P.seqMap(P.string('?'), P.optWhitespace, P.eof, () => {
            return {
                action: Command_1.Action.Context,
            };
        });
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
        return this.allocate(new Set([]), expr);
    }
    parseCommand(src) {
        const command = this.commandParser.command.tryParse(src);
        switch (command.action) {
            case Command_1.Action.Eval:
            case Command_1.Action.EvalLast:
            case Command_1.Action.EvalHead:
            case Command_1.Action.EvalTail:
                {
                    command.operand.expr = this.allocate(new Set([]), command.operand.expr);
                    return command;
                }
            case Command_1.Action.Add:
            case Command_1.Action.Update:
                {
                    command.operand.func.bareExpr = this.allocate(new Set(command.operand.func.params), command.operand.func.bareExpr);
                    return command;
                }
            default: {
                return command;
            }
        }
    }
    /**
     * Variable と Combinator の振り分けがされていない式に対して、正しく振り分けを行う
     *
     * @param set  いま着目している場所より外側の Lambda で登場した変数名を蓄積する集合
     * @param expr Variable と Combinator の振り分けがされる前の式
     */
    allocate(set, expr) {
        switch (expr.type) {
            case 'Variable': {
                if (set.has(expr.label)) {
                    return expr;
                }
                return {
                    type: 'Combinator',
                    label: expr.label,
                };
            }
            case 'Combinator': {
                if (!set.has(expr.label)) {
                    return expr;
                }
                return {
                    type: 'Variable',
                    label: expr.label,
                };
            }
            case 'Symbol': {
                return expr;
            }
            case 'Apply': {
                return {
                    type: 'Apply',
                    left: this.allocate(set, expr.left),
                    right: this.allocate(set, expr.right),
                };
            }
            case 'Lambda': {
                set.add(expr.param);
                return {
                    type: 'Lambda',
                    param: expr.param,
                    body: this.allocate(set, expr.body),
                };
            }
        }
    }
}
exports.default = new ES2015StyleParser(exports.ExprParser, exports.CommandParser);
//# sourceMappingURL=ES2015StyleParser.js.map