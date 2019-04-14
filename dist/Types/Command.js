"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Action;
(function (Action) {
    Action.Eval = 'Eval';
    Action.EvalLast = 'EvalLast';
    Action.EvalHead = 'EvalHead';
    Action.EvalTail = 'EvalTail';
    Action.Add = 'Add';
    Action.Update = 'Update';
    Action.Delete = 'Delete';
    Action.Info = 'Info';
    Action.Context = 'Context';
})(Action = exports.Action || (exports.Action = {}));
class Command {
}
exports.Command = Command;
class EvalCommand extends Command {
    constructor(expr) {
        super();
        this.expr = expr;
    }
    map(callbackfn) {
        return new EvalCommand(callbackfn(this.expr));
    }
    get action() {
        return Action.Eval;
    }
    toJSON() {
        return {
            action: Action.Eval,
            expr: this.expr.toJSON(),
        };
    }
}
exports.EvalCommand = EvalCommand;
class EvalLastCommand extends Command {
    constructor(expr) {
        super();
        this.expr = expr;
    }
    map(callbackfn) {
        return new EvalLastCommand(callbackfn(this.expr));
    }
    get action() {
        return Action.EvalLast;
    }
    toJSON() {
        return {
            action: Action.EvalLast,
            expr: this.expr.toJSON(),
        };
    }
}
exports.EvalLastCommand = EvalLastCommand;
class EvalHeadCommand extends Command {
    constructor(expr, maxLength) {
        super();
        this.expr = expr;
        this.maxLength = maxLength;
    }
    map(callbackfn) {
        return new EvalHeadCommand(callbackfn(this.expr), this.maxLength);
    }
    get action() {
        return Action.EvalHead;
    }
    toJSON() {
        return {
            action: Action.EvalHead,
            expr: this.expr.toJSON(),
            maxLength: this.maxLength,
        };
    }
}
exports.EvalHeadCommand = EvalHeadCommand;
class EvalTailCommand extends Command {
    constructor(expr, maxLength) {
        super();
        this.expr = expr;
        this.maxLength = maxLength;
    }
    map(callbackfn) {
        return new EvalTailCommand(callbackfn(this.expr), this.maxLength);
    }
    get action() {
        return Action.EvalTail;
    }
    toJSON() {
        return {
            action: Action.EvalTail,
            expr: this.expr.toJSON(),
            maxLength: this.maxLength,
        };
    }
}
exports.EvalTailCommand = EvalTailCommand;
class AddCommand extends Command {
    constructor(identifier, callable) {
        super();
        this.identifier = identifier;
        this.callable = callable;
    }
    map(callbackfn) {
        return new AddCommand(this.identifier, callbackfn(this.callable));
    }
    get action() {
        return Action.Add;
    }
    toJSON() {
        return {
            action: Action.Add,
            identifier: this.identifier,
            callable: this.callable.toJSON(),
        };
    }
}
exports.AddCommand = AddCommand;
class UpdateCommand extends Command {
    constructor(identifier, callable) {
        super();
        this.identifier = identifier;
        this.callable = callable;
    }
    map(callbackfn) {
        return new UpdateCommand(this.identifier, callbackfn(this.callable));
    }
    get action() {
        return Action.Update;
    }
    toJSON() {
        return {
            action: Action.Update,
            identifier: this.identifier,
            callable: this.callable.toJSON(),
        };
    }
}
exports.UpdateCommand = UpdateCommand;
class DeleteCommand extends Command {
    constructor(identifier) {
        super();
        this.identifier = identifier;
    }
    get action() {
        return Action.Delete;
    }
    toJSON() {
        return {
            action: Action.Delete,
            identifier: this.identifier,
        };
    }
}
exports.DeleteCommand = DeleteCommand;
class InfoCommand extends Command {
    constructor(identifier) {
        super();
        this.identifier = identifier;
    }
    get action() {
        return Action.Info;
    }
    toJSON() {
        return {
            action: Action.Info,
            identifier: this.identifier,
        };
    }
}
exports.InfoCommand = InfoCommand;
class ContextCommand extends Command {
    constructor() {
        super();
    }
    get action() {
        return Action.Context;
    }
    toJSON() {
        return {
            action: Action.Context,
        };
    }
}
exports.ContextCommand = ContextCommand;
//# sourceMappingURL=Command.js.map