"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const ApplicationError_1 = require("./Error/ApplicationError");
const isStack = immutable_1.Stack.isStack;
class Location {
    constructor(breadcrumbs) {
        this.breadcrumbs = breadcrumbs;
    }
    goRight(left) {
        const newBreadcrumbs = this.breadcrumbs.push(left);
        return new Location(newBreadcrumbs);
    }
    goLeft(right) {
        const breadcrumb = this.breadcrumbs.first();
        const newBreadcrumbs = isStack(breadcrumb)
            ? this.breadcrumbs.shift().push(breadcrumb.push(right))
            : this.breadcrumbs.push(immutable_1.Stack.of(right));
        return new Location(newBreadcrumbs);
    }
    popRightTrees(size) {
        const rightTrees = this.breadcrumbs.first();
        if (!isStack(rightTrees)) {
            throw new ApplicationError_1.ApplicationError('There is No Right Trees');
        }
        if (rightTrees.size < size) {
            throw new ApplicationError_1.ApplicationError('Insufficient Length　Right Trees');
        }
        const newRightTrees = rightTrees.slice(size);
        const newBreadcrumbs = newRightTrees.isEmpty()
            ? this.breadcrumbs.shift()
            : this.breadcrumbs.shift().push(newRightTrees);
        return [
            rightTrees.slice(0, size).toArray(),
            new Location(newBreadcrumbs),
        ];
    }
    reassemble(current) {
        return Location._reassemble(current, this.breadcrumbs);
    }
    static _reassemble(current, breadcrumbs) {
        if (breadcrumbs.isEmpty()) {
            return current;
        }
        const breadcrumb = breadcrumbs.first();
        if (isStack(breadcrumb)) {
            const rightTrees = breadcrumb;
            const newExpr = rightTrees.reduce((expr, right) => {
                return {
                    type: 'Apply',
                    left: expr,
                    right
                };
            }, current);
            return this._reassemble(newExpr, breadcrumbs.shift());
        }
        else {
            const left = breadcrumb;
            const newExpr = {
                type: 'Apply',
                left,
                right: current,
            };
            return this._reassemble(newExpr, breadcrumbs.shift());
        }
    }
    static root() {
        return new this(immutable_1.Stack());
    }
}
exports.Location = Location;
//# sourceMappingURL=Location.js.map