"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
                return new Variable(json.label);
            }
            case 'Combinator': {
                return new Combinator(json.label);
            }
            case 'Symbol': {
                return new Symbl(json.label);
            }
            case 'Lambda': {
                return new Lambda(json.param, Expr.fromJSON(json.body));
            }
            case 'Apply': {
                return new Apply(Expr.fromJSON(json.left), Expr.fromJSON(json.right));
            }
        }
    }
}
exports.Expr = Expr;
class Variable extends Expr {
    constructor(label) {
        super();
        this.label = label;
    }
    reduce(context) {
        return null;
    }
    invoke(context, args) {
        return args.reduce((expr, arg) => {
            return new Apply(expr, arg);
        }, this);
    }
    rewrite(variable, expr) {
        return this.label === variable.label ? expr : this;
    }
    toJSON() {
        return {
            type: ExprType.Variable,
            label: this.label,
        };
    }
}
exports.Variable = Variable;
// export interface Variable {
//     type: 'Variable',
//     label: Identifier,
// }
// export interface Combinator {
//     type: 'Combinator',
//     label: Identifier,
// }
class Combinator extends Expr {
    constructor(label) {
        super();
        this.label = label;
    }
    reduce(context) {
        return null;
    }
    invoke(context, args) {
        return args.reduce((expr, arg) => {
            return new Apply(expr, arg);
        }, this);
    }
    rewrite(variable, expr) {
        return this;
    }
    toJSON() {
        return {
            type: ExprType.Combinator,
            label: this.label,
        };
    }
}
exports.Combinator = Combinator;
// export interface Symbl {
//     type: 'Symbol',
//     label: Identifier,
// }
class Symbl extends Expr {
    constructor(label) {
        super();
        this.label = label;
    }
    reduce(context) {
        return null;
    }
    invoke(context, args) {
        return args.reduce((expr, arg) => {
            return new Apply(expr, arg);
        }, this);
    }
    rewrite(variable, expr) {
        return this;
    }
    toJSON() {
        return {
            type: ExprType.Symbol,
            label: this.label,
        };
    }
}
exports.Symbl = Symbl;
// export interface Lambda {
//     type: 'Lambda',
//     param: Identifier,
//     body: Expr,
// }
class Lambda extends Expr {
    constructor(param, body) {
        super();
        this.param = param;
        this.body = body;
    }
    reduce(context) {
        return null;
    }
    invoke(context, args) {
        const [head] = args.slice(0, 1);
        const tail = args.slice(1);
        return tail.reduce((expr, arg) => {
            return new Apply(expr, arg);
        }, this.rewrite(new Variable(this.param), head));
    }
    rewrite(variable, expr) {
        if (this.param === variable.label) {
            return this;
        }
        return new Lambda(this.param, this.body.rewrite(variable, expr));
    }
    toJSON() {
        return {
            type: ExprType.Lambda,
            param: this.param,
            body: this.body.toJSON(),
        };
    }
}
exports.Lambda = Lambda;
// export interface Apply {
//     type: 'Apply',
//     left: Expr,
//     right: Expr,
// }
class Apply extends Expr {
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
    }
    reduce(context) {
        return undefined;
    }
    invoke(context, args) {
        return undefined;
    }
    rewrite(variable, expr) {
        return new Apply(this.left.rewrite(variable, expr), this.right.rewrite(variable, expr));
    }
    toJSON() {
        return {
            type: ExprType.Apply,
            left: this.left.toJSON(),
            right: this.right.toJSON(),
        };
    }
}
exports.Apply = Apply;
//# sourceMappingURL=Expr.js.map