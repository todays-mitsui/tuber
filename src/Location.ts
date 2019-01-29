import { Stack } from 'immutable'

import { Expr, Apply } from './Types/Expr';
import { ApplicationError } from './Error/ApplicationError';

const isStack = Stack.isStack

export class Location {
    public constructor(private breadcrumbs: Stack<Expr|Stack<Expr>>) {
    }

    public goRight(left: Expr) {
        const newBreadcrumbs = this.breadcrumbs.push(left)

        return new Location(newBreadcrumbs)
    }

    public goLeft(right: Expr) {
        const breadcrumb = this.breadcrumbs.first()

        const newBreadcrumbs = isStack(breadcrumb)
            ? this.breadcrumbs.shift().push(breadcrumb.push(right))
            : this.breadcrumbs.push(Stack.of(right))

        return new Location(newBreadcrumbs)
    }

    public popRightTrees(size: number): [Expr[], Location] {
        const rightTrees = this.breadcrumbs.first()

        if (!isStack(rightTrees)) {
          throw new ApplicationError('There is No Right Trees')
        }

        if (rightTrees.size < size) {
          throw new ApplicationError('Insufficient Length　Right Trees')
        }

        const newRightTrees = rightTrees.slice(size)
        const newBreadcrumbs = newRightTrees.isEmpty()
            ? this.breadcrumbs.shift()
            : this.breadcrumbs.shift().push(newRightTrees)

        return [
            rightTrees.slice(0, size).toArray(),
            new Location(newBreadcrumbs),
        ]
    }

    public reassemble(current: Expr) {
        return Location._reassemble(current, this.breadcrumbs)
    }

    static _reassemble(current: Expr, breadcrumbs: Stack<Expr|Stack<Expr>>) {
        if (breadcrumbs.isEmpty()) {
            return current
        }

        const breadcrumb = breadcrumbs.first()

        if (isStack(breadcrumb)) {
            const rightTrees = breadcrumb

            const newExpr = rightTrees.reduce((expr, right): Apply => {
                return {
                    type: 'Apply',
                    left: expr,
                    right
                }
            }, current);

            return this._reassemble(newExpr, breadcrumbs.shift())
        } else {
            const left = breadcrumb

            const newExpr = {
                type: 'Apply',
                left,
                right: current,
            } as Apply

            return this._reassemble(newExpr, breadcrumbs.shift())
        }
    }

    static root() {
        return new this(Stack())
    }
}
