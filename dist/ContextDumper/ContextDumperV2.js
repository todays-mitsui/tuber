"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ContextDumper_1 = require("../ContextDumper");
class ContextDumperV2 extends ContextDumper_1.ContextDumper {
    dump(context) {
        const translated = context.entories.map(([label, callable]) => (Object.assign({ N: label }, callable.dump())));
        return {
            version: '2.0',
            context: translated,
        };
    }
}
exports.ContextDumperV2 = ContextDumperV2;
//# sourceMappingURL=ContextDumperV2.js.map