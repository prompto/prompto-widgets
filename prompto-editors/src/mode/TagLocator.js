const TAG_REGEXP = /<\s*[^>^/]+(\s+[^>]+)*>/g;

export default class TagLocator {

    constructor(lines) {
        this.lines = lines;
    }

    locateTagAt(location) {
        const line = this.lines[location.row] || "";
        const matches = line.match(TAG_REGEXP);
        if (matches) {
            for (let i = 0, idx = -1; i < matches.length; i++) {
                const match = matches[i];
                idx = line.indexOf(match, idx);
                if (idx <= location.column && idx + match.length >= location.column)
                    return {
                        tag: match.substring(1, match.length - 1).trim().split(" ")[0],
                        location: {
                            row: location.row,
                            column: idx
                        }
                    };
            }
        }
        return null;

    }
}
