"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Route_1 = require("../../Route");
const Result_1 = require("../../Result");
const immutable_1 = require("immutable");
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
    tryReduce(context, route) {
        return new Result_1.Fail();
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
class Combinator extends Expr {
    constructor(label) {
        super();
        this.label = label;
    }
    reduce(context) {
        return null;
    }
    tryReduce(context, route) {
        const func = context.get(this);
        if (!func) {
            return new Result_1.Fail();
        }
        try {
            const arity = func.arity;
            const [args, newRoute] = route.popRightTrees(arity);
            return new Result_1.Just(newRoute.reassemble(this.invoke(context, args)));
        }
        catch (e) {
            return new Result_1.Fail();
        }
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
class Symbl extends Expr {
    constructor(label) {
        super();
        this.label = label;
    }
    reduce(context) {
        return null;
    }
    tryReduce(context, route) {
        return new Result_1.Fail();
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
class Lambda extends Expr {
    constructor(param, body) {
        super();
        this.param = param;
        this.body = body;
    }
    reduce(context) {
        return null;
    }
    tryReduce(context, route) {
        try {
            const [[arg], newRoute] = route.popRightTrees(1);
            return new Result_1.Just(newRoute.reassemble(this.invoke(context, [arg])));
        }
        catch (e) {
            return new Result_1.Fail();
        }
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
class Apply extends Expr {
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
    }
    reduce(context) {
        let [current, route] = [this.left, Route_1.Route.root().goLeft(this.right)];
        let tryStack = immutable_1.Stack.of([this.right, Route_1.Route.root().goRight(this.left)]);
        do {
            let result = current.tryReduce(context, route);
            if (result instanceof Result_1.Try) {
                tryStack = tryStack.push(...result.val);
            }
            else if (result instanceof Result_1.Just) {
                return result.val;
            }
            [current, route] = tryStack.first();
            tryStack = tryStack.shift();
        } while (!tryStack.isEmpty());
        return undefined;
    }
    tryReduce(context, route) {
        return new Result_1.Try([
            [this.left, route.goLeft(this.right)],
            [this.right, route.goLeft(this.left)],
        ]);
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