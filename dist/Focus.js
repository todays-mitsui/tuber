"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Location_1 = require("./Location");
const immutable_1 = require("immutable");
const ApplicationError_1 = require("./Error/ApplicationError");
class Just {
    constructor(val) {
        this.val = val;
    }
}
class Try {
    constructor(vals) {
        this.vals = vals;
    }
}
class Fail {
}
class Focus {
    constructor(_current, _location = Location_1.Location.root()) {
        this._current = _current;
        this._location = _location;
    }
    get expr() {
        return this._location.reassemble(this._current);
    }
    get current() {
        return this._current;
    }
    get location() {
        return this._location;
    }
    goLeft() {
        if (this.current.type !== 'Apply') {
            throw new ApplicationError_1.ApplicationError('現在フォーカスしている節は関数適用ではありません');
        }
        return new Focus(this.current.left, this.location.goLeft(this.current.right));
    }
    goRight() {
        if (this.current.type !== 'Apply') {
            throw new ApplicationError_1.ApplicationError('現在フォーカスしている節は関数適用ではありません');
        }
        return new Focus(this.current.right, this.location.goRight(this.current.left));
    }
    popRightTrees(n) {
        return this.location.popRightTrees(n);
    }
    invoke(args) {
        if (this.current.type !== 'Lambda' && this.current.type !== 'Combinator') {
            throw new ApplicationError_1.ApplicationError('現在フォーカスしている節は簡約可能ではありません');
        }
        this.current.betaRedex = true;
        return undefined;
    }
    reduce(context) {
        let focus = this;
        let tryStack = immutable_1.Stack();
        do {
            let result = Focus._reduce(context, focus);
            if (result instanceof Try) {
                tryStack = tryStack.push(...result.vals);
            }
            else if (result instanceof Just) {
                return new Focus(result.val);
            }
            focus = tryStack.first();
            tryStack = tryStack.shift();
        } while (!tryStack.isEmpty());
        return null;
    }
    static _reduce(context, focus) {
        switch (focus.current.type) {
            case 'Lambda': {
                try {
                    const [[arg], newLocation] = focus.popRightTrees(1);
                    return new Just(newLocation.reassemble(focus.invoke([arg])));
                }
                catch (e) {
                    return new Fail();
                }
            }
            case 'Apply': {
                return new Try([
                    focus.goLeft(),
                    focus.goRight(),
                ]);
            }
            case 'Combinator': {
                const func = context.get(focus.current);
                if (!func) {
                    return new Fail();
                }
                try {
                    const arity = func.arity;
                    const [args, newLocation] = focus.popRightTrees(arity);
                    return new Just(newLocation.reassemble(focus.invoke(args)));
                }
                catch (e) {
                    return new Fail();
                }
            }
            default: {
                return new Fail();
            }
        }
    }
}
exports.Focus = Focus;
//# sourceMappingURL=Focus.js.map