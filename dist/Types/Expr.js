"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Route_1 = require("../Route");
const Result_1 = require("../Result");
const immutable_1 = require("immutable");
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
    rewrite(identifier, expr) {
        return this.label === identifier ? expr : this;
    }
    toJSON() {
        return {
            type: 'Variable',
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
        const callable = context.get(this);
        if (!callable) {
            return new Result_1.Fail();
        }
        try {
            const arity = callable.arity;
            const [args, newRoute] = route.popRightTrees(arity);
            return new Result_1.Just(newRoute.reassemble(callable.call(...args)));
        }
        catch (e) {
            return new Result_1.Fail();
        }
    }
    rewrite(identifier, expr) {
        return this;
    }
    toJSON() {
        return {
            type: 'Combinator',
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
    rewrite(identifier, expr) {
        return this;
    }
    toJSON() {
        return {
            type: 'Symbol',
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
            return new Result_1.Just(newRoute.reassemble(this.body.rewrite(this.param, arg)));
        }
        catch (e) {
            return new Result_1.Fail();
        }
    }
    rewrite(identifier, expr) {
        if (this.param === identifier) {
            return this;
        }
        return new Lambda(this.param, this.body.rewrite(identifier, expr));
    }
    toJSON() {
        return {
            type: 'Lambda',
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
        let tryStack = immutable_1.Stack.of([this.left, Route_1.Route.root().goLeft(this.right)], [this.right, Route_1.Route.root().goRight(this.left)]);
        do {
            const [current, route] = tryStack.first();
            tryStack = tryStack.shift();
            let result = current.tryReduce(context, route);
            if (result instanceof Result_1.Try) {
                tryStack = tryStack.push(...result.val);
            }
            else if (result instanceof Result_1.Just) {
                return result.val;
            }
        } while (!tryStack.isEmpty());
        return null;
    }
    tryReduce(context, route) {
        return new Result_1.Try([
            [this.left, route.goLeft(this.right)],
            [this.right, route.goRight(this.left)],
        ]);
    }
    rewrite(identifier, expr) {
        return new Apply(this.left.rewrite(identifier, expr), this.right.rewrite(identifier, expr));
    }
    toJSON() {
        return {
            type: 'Apply',
            left: this.left.toJSON(),
            right: this.right.toJSON(),
        };
    }
}
exports.Apply = Apply;
//# sourceMappingURL=Expr.js.map