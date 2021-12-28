const Diff = require("diff");

export default class ChangeBuilder {

    static computeChanges(lhs, rhs) {
        lhs = lhs.trim();
        rhs = rhs.trim();
        const lhs_lines = lhs.split("\n");
        const rhs_lines = rhs.split("\n")
        let diffs = [];
        if(lhs !== rhs) {
            if(lhs.length === 0)
                diffs = [ { count: rhs_lines.length, added: true, removed: undefined,value: rhs_lines } ];
            else if(rhs.length === 0)
                diffs = [ { count: lhs_lines.length, added: undefined, removed: true, value: lhs_lines } ];
            else
                diffs = Diff.diffArrays(lhs_lines, rhs_lines);
        }
        return ChangeBuilder.mergeDifferences(diffs);
    }

    static mergeDifferences(diffs) {
        let leftLine = 1;
        let rightLine = 1;
        const changes = [];
        for(let i=0; i<diffs.length; i++) {
            const d1 = diffs[i];
            if(d1.removed && i+1 < diffs.length) {
                const d2 = diffs[i+1];
                if(d2.added) {
                    changes.push({ left: { line: leftLine, count: d1.count }, right: { line: rightLine, count: d2.count }});
                    leftLine += d1.count;
                    rightLine += d2.count;
                    i++;
                    continue;
                }
            }
            if(d1.removed) {
                changes.push({ left: { line: leftLine, count: d1.count }, right: { line: rightLine, count: 0 }});
                leftLine += d1.count;
            } else if(d1.added) {
                changes.push({ left: { line: leftLine, count: 0 }, right: { line: rightLine, count: d1.count }});
                rightLine += d1.count;
            } else {
                leftLine += d1.count;
                rightLine += d1.count;
            }
        }
        return changes;
    }

}
