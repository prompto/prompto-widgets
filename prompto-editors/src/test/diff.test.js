const Diff = require("diff");

function computeDiffedLines(lhs, rhs) {
    return Diff.diffLines(lhs, rhs);
}

function flattenDiffedLines(diffed) {
    const result = {
        left: [],
        right: []
    };
    let leftLine = 1;
    let rightLine = 1;
    diffed.forEach( d => {
        if(d.added) {
            result.right.push({startLine: rightLine, endLine: rightLine + d.count - 1}) ;
            rightLine += d.count;
        } else if(d.removed) {
            result.left.push({startLine: leftLine, endLine: leftLine + d.count - 1}) ;
            leftLine += d.count;
        } else  {
            leftLine += d.count;
            rightLine += d.count;
        }
    });
    return result;
}

function computeChanges(lhs, rhs) {
    const diffed = Diff.diffArrays(lhs.split("\n"), rhs.split("\n"));
    let leftLine = 1;
    let rightLine = 1;
    const changes = [];
    for(let i=0; i<diffed.length; i++) {
        const d1 = diffed[i];
        if(d1.removed && i+1<diffed.length) {
            const d2 = diffed[i+1];
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


it("detects added or deleted lines", () => {
    const currentVersion = [1, 2 ,3, 6, 7, 8, 9, 10].map(i => "line " + i).join("\n");
    const proposedVersion = [1, 2 ,3, 4, 5, 6, 7, 10].map(i => "line " + i).join("\n");
    const diffed = computeDiffedLines(currentVersion, proposedVersion);
    const actual = flattenDiffedLines(diffed);
    const expected = {
        "left": [
            {
                "startLine": 6,
                "endLine": 7
            },
        ],
        "right": [
            {
                "startLine": 4,
                "endLine": 5
            }
        ]
    };
    expect(actual).toEqual(expected);
});


it("detects changed line", () => {
    const currentVersion = ["Hello", "Hi", "John"].join("\n");
    const proposedVersion = ["Hello", "Hi there", "John"].join("\n");
    const diffed = computeDiffedLines(currentVersion, proposedVersion);
    const actual = flattenDiffedLines(diffed);
    const expected = {
        "left": [
            {
                "startLine": 2,
                "endLine": 2
            },
        ],
        "right": [
            {
                "startLine": 2,
                "endLine": 2
            }
        ]
    };
    expect(actual).toEqual(expected);
});

it("computes changes", () => {
    const currentVersion = ["Common", "Changed 1", "Deleted", "Common 2"].join("\n");
    const proposedVersion = ["Common", "Changed 2", "Common 2", "Added"].join("\n");
    const actual = computeChanges(currentVersion, proposedVersion);
    const expected = [
        {
            "left": { "line": 2, "count": 2 },
            "right": { "line": 2, "count": 1 }
        },
       {
            "left": { "line": 5, "count": 0 },
            "right": { "line": 4, "count": 1 }
        }
    ];
    expect(actual).toEqual(expected);
});
