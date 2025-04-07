// Builder For Query in webz (Make queries extendable)
export class QueryBuilder {
    private _query = "";

    constructor(query: string) {
        this._query = query;
    }
    private _compound(type: 'AND' | 'OR' | 'NOT', keys: string[]) {
        const query = this._query + ` ${type} (${keys.join(` ${type} `)})`;
        this._query = `(${query})`;
    }

    // encapsulate parenthesis (), AND +, OR , NOT -, 
    and(first: string, ...keys: string[]) {
        this._compound('AND', [first, ...keys])
        return this;
    }

    or(first: string, ...keys: string[]) {
        this._compound('OR', [first, ...keys])
        return this;
    }

    not(first: string, ...keys: string[]) {
        this._compound('NOT', [first, ...keys])
        return this;
    }

    // literal quotation "",
    static literal(key: string) {
        return `"${key}"`;
    }

    // wildcard asterisk *,
    static stemming(key: string) {
        return `${key.replaceAll('$','')}*`; // $ * Cannot co-exists
    }

    // disable stemming $, 
    static disableStemming(key: string) {
        return `${key.replaceAll('*','')}$`; // $ * Cannot co-exists
    }

    getFinalQuery(){
        return this._query;
    }
}
