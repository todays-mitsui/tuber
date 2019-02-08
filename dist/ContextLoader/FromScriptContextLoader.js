"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ContextLoader_1 = require("../ContextLoader");
const Context_1 = require("../Context");
const ApplicationError_1 = require("../Error/ApplicationError");
class FromScriptContextLoader extends ContextLoader_1.ContextLoader {
    constructor(filepath, parser) {
        super();
        this.filepath = filepath;
        this.parser = parser;
        this.context = new Context_1.Context();
    }
    load() {
        // TODO: 実装
        throw new ApplicationError_1.ApplicationError('TODO: 実装');
        return this.context;
    }
}
exports.FromScriptContextLoader = FromScriptContextLoader;
//# sourceMappingURL=FromScriptContextLoader.js.map