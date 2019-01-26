export type Expr = Variable
                   | Combinator
                   | Symbl
                   | Lambda
                   | Apply


export interface Variable {
    type: 'Variable',
    label: Identifier,
}

export interface Combinator {
    type: 'Combinator',
    label: Identifier,
}

export interface Symbl {
    type: 'Symbol',
    label: Identifier,
}

export interface Lambda {
    type: 'Lambda',
    param: Identifier,
    body: Expr,
}

export interface Apply {
    type: 'Apply',
    left: Expr,
    right: Expr,
}


export type Identifier = string
