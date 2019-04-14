"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const ApplicationError_1 = require("./Error/ApplicationError");
class Context {
    constructor() {
        this.map = immutable_1.OrderedMap();
    }
    add(combinator, callable) {
        if (this.map.has(combinator.label)) {
            throw new ApplicationError_1.ApplicationError(`識別子 '${combinator.label}' はすでに定義されています`);
        }
        this.map = this.map.set(combinator.label, callable);
        return this;
    }
    update(combinator, callable) {
        this.map = this.map.set(combinator.label, callable);
        return this;
    }
    del(combinator) {
        this.map = this.map.delete(combinator.label);
        return this;
    }
    has(combinator) {
        return this.map.has(combinator.label);
    }
    get(combinator) {
        if (!this.map.has(combinator.label)) {
            return null;
        }
        return this.map.get(combinator.label);
    }
    get size() {
        return this.map.size;
    }
    get entories() {
        return this.map.toArray();
    }
}
exports.Context = Context;
//# sourceMappingURL=Context.js.map