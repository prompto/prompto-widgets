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
                idx = line.indexOf(match, idx + 1);
                const tagName = match.substring(1, match.length - 1).trim().split(" ")[0];
                const idxTag = idx + match.indexOf(tagName);
                if (location.column >= idxTag && location.column <= idxTag + tagName.length )
                    return {
                        fullTag: match,
                        tagName: tagName,
                        location: {
                            row: location.row,
                            column: idx
                        }
                    };
            }
        }
        return null;
    }

    locateClosingTagOf(tagLocation) {
        // find next opening tag
        const embedded_opening = this.locateOpeningTagAfter(tagLocation);
        const embedded_closing = embedded_opening ? this.locateClosingTagOf(embedded_opening) : null;
        // find closing tag before or after embedded tag
        let closing_row = tagLocation.location.row;
        let closing_column = tagLocation.location.column + 1;
        const closing_pattern = new RegExp("<\\s*\\/\\s*" + tagLocation.tagName + "\\s*>", "g");
        let closing_match = null;
        while(closing_match == null && closing_row < this.lines.length) {
            closing_match = this.nextMatch(closing_pattern, { row: closing_row, column: closing_column});
            if(closing_match) {
                closing_column += closing_match.fullTag.length;
                if(embedded_opening && embedded_closing) {
                    const closing_location = closing_match.location;
                    let embedded_location = embedded_opening.location;
                    if (closing_location.row < embedded_location.row || (closing_location.row === embedded_location.row && closing_location.column < embedded_location.column))
                        break;
                    embedded_location = embedded_closing.location;
                    if (closing_location.row > embedded_location.row || (closing_location.row === embedded_location.row && closing_location.column >= embedded_location.column + embedded_closing.fullTag.length))
                        break;
                    else
                        closing_match = null;
                }
            } else
                closing_column = this.lines[closing_row].length + 1;
            if(closing_column > this.lines[closing_row].length) {
                closing_row++;
                closing_column = 0;
            }
        }
        return closing_match;
    }

    nextMatch(pattern, location) {
        let line = this.lines[location.row].substring(location.column);
        let matches = line.match(pattern);
        if(matches) {
            const match = matches[0];
            return {
                fullTag: match,
                tagName: match.substring(1, match.length - 1).trim().split(" ")[0],
                location: {
                    row: location.row,
                    column: location.column + line.indexOf(match)
                }
            };
        }
        let row = location.row + 1;
        while(matches === null && row < this.lines.length) {
            line = this.lines[row];
            matches = line.match(pattern);
            if(matches) {
                const match = matches[0];
                return {
                    fullTag: match,
                    tagName: match.substring(1, match.length - 1).trim().split(" ")[0],
                    location: {
                        row: row,
                        column: line.indexOf(match)
                    }
                }
            } else
                row++;
        }
        return null;
    }

    locateOpeningTagAfter(tagLocation) {
        const opening_pattern = new RegExp("<\\s*" + tagLocation.tagName + "(\\s+[^>]+)*>", "g");
        const line = this.lines[tagLocation.location.row].substring(tagLocation.location.column + 1);
        let line_idx = tagLocation.location.row;
        let matches = line.match(opening_pattern);
        if(matches == null) {
            for( line_idx++ ; line_idx < this.lines.length && matches == null; ) {
                matches = this.lines[line_idx].match(opening_pattern);
                if(matches == null)
                    line_idx++;
            }
        }
        if(matches !== null) {
            const start = line_idx === tagLocation.location.row ? tagLocation.location.column + 1 : 0;
            const match = matches[0];
            const column = this.lines[line_idx].indexOf(matches, start);
            return {
                fullTag: match,
                tagName: match.substring(1, match.length - 1).trim().split(" ")[0],
                location: { row: line_idx, column: column }};
        }
        return null;
    }
}

