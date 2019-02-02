"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lambda_1 = require("./Expr/Lambda");
const Apply_1 = require("./Expr/Apply");
const Variable_1 = require("./Expr/Variable");
const Combinator_1 = require("./Expr/Combinator");
const Symbl_1 = require("./Expr/Symbl");
var ExprType;
(function (ExprType) {
    ExprType.Variable = 'Variable';
    ExprType.Combinator = 'Combinator';
    ExprType.Symbol = 'Symbol';
    ExprType.Lambda = 'Lambda';
    ExprType.Apply = 'Apply';
})(ExprType = exports.ExprType || (exports.ExprType = {}));
class Expr {
    static fromJSON(json) {
        switch (json.type) {
            case 'Variable': {
                return new Variable_1.Variable(json.label);
            }
            case 'Combinator': {
                return new Combinator_1.Combinator(json.label);
            }
            case 'Symbol': {
                return new Symbl_1.Symbl(json.label);
            }
            case 'Lambda': {
                return new Lambda_1.Lambda(json.param, Expr.fromJSON(json.body));
            }
            case 'Apply': {
                return new Apply_1.Apply(Expr.fromJSON(json.left), Expr.fromJSON(json.right));
            }
        }
    }
}
exports.Expr = Expr;
//# sourceMappingURL=Expr.js.map