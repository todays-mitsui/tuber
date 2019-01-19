"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const P = require("parsimmon");
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
exports.Parser = P.createLanguage({
    expr(r) {
        return P.alt(r.lambda, r.applys);
    },
    // 関数適用
    applys(r) {
        return P.seqMap(r.callable, token(r.args).wrap(P.string('('), P.string(')')).many(), (e1, argss) => (argss.reduce((e2, args) => (args.reduce((left, right) => ({
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
//# sourceMappingURL=ES2015StyleParser.js.map