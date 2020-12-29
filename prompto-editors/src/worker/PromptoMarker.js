import Range from "../ace/Range";

export default class PromptoMarker extends Range {

    static compute(data) {
        const merged = [];
        data.map(a => new PromptoMarker(a.row, a.column, a.endRow, a.endColumn, a.type)).forEach(m => m.mergeInto(merged));
        return merged;
    }

    constructor(startRow, startColumn, endRow, endColumn, type) {
        super(startRow, startColumn, endRow, endColumn);
        this.type = type;
    }

    extend(row, column) {
        const cmp = this.compare(row, column);
        if (cmp === 0)
            return this;
        const start = (cmp === -1) ? {row: row, column: column} : this.start;
        const end = (cmp === 1) ? {row: row, column: column} : this.end;
        return new PromptoMarker(start.row, start.column, end.row, end.column, this.type);
    }

    mergeInto(merged) {
        const mergeable = merged.filter( m => m.intersects(this) );
        if( mergeable.length === 0)
            merged.push(this);
        else {
            // recursively merge first intersecting range
            const idx = merged.indexOf(mergeable[0]);
            const old = merged.splice(idx, 1)[0];
            const extended = old.extend(this.start.row, this.start.column).extend(this.end.row, this.end.column);
            extended.type = (this.type !== extended.type) ? "error" : "warning";
            extended.mergeInto(merged);
        }
    }
}

