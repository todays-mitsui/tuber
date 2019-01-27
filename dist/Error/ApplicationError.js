"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApplicationError {
    constructor(message) {
        this.message = message;
        this.name = 'ApplicationError';
    }
    toString() {
        return this.name + ': ' + this.message;
    }
}
exports.ApplicationError = ApplicationError;
//# sourceMappingURL=ApplicationError.js.map