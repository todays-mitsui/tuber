"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ContextDumper_1 = require("../ContextDumper");
class ContextDumperV2 extends ContextDumper_1.ContextDumper {
    dump(context) {
        const translated = context.entories.map(([label, callable]) => {
            const callableJson = callable.toJSON();
            return {
                N: label,
                P: callableJson.params,
                E: this.translate(callableJson.bareExpr)
            };
        });
        return {
            version: '2.0',
            context: translated,
        };
    }
    translate(expr) {
        switch (expr.type) {
            case 'Variable':
                return { V: expr.label };
            case 'Combinator':
                return { C: expr.label };
            case 'Symbol':
                return { S: expr.label };
            case 'Lambda':
                return {
                    P: expr.param,
                    E: this.translate(expr.body),
                };
            case 'Apply':
                return {
                    L: this.translate(expr.left),
                    R: this.translate(expr.right),
                };
        }
    }
}
exports.ContextDumperV2 = ContextDumperV2;
//# sourceMappingURL=ContextDumperV2.js.map