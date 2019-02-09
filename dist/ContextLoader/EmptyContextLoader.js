"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ContextLoader_1 = require("../ContextLoader");
const Context_1 = require("../Context");
class EmptyContextLoader extends ContextLoader_1.ContextLoader {
    constructor() {
        super();
        this._context = new Context_1.Context();
    }
    load() {
        return this._context;
    }
}
exports.EmptyContextLoader = EmptyContextLoader;
//# sourceMappingURL=EmptyContextLoader.js.map