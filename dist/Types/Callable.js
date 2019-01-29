"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Callable {
    constructor(params, bareExpr) {
        this.params = params;
        this.bareExpr = bareExpr;
    }
    toJSON() {
        return {
            params: this.params,
            bareExpr: this.bareExpr.toJSON(),
        };
    }
}
exports.Callable = Callable;
//# sourceMappingURL=Callable.js.map