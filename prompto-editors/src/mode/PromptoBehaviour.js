import TagLocator from "./TagLocator";

let context = null;
let contextCaches = {};

function initContext(editor) {
    let id = -1;
    // noinspection JSUnresolvedVariable
    if (editor.multiSelect) {
        id = editor.selection.index;
        if (contextCaches.rangeCount !== editor.multiSelect.rangeCount)
            contextCaches = {rangeCount: editor.multiSelect.rangeCount};
    }
    context = contextCaches[id];
    if(!context)
        context = {
            autoInsertedClosings: 0,
            autoInsertedRow: -1,
            autoInsertedLineEnd: "" /*,
            maybeInsertedClosings: 0,
            maybeInsertedRow: -1,
            maybeInsertedLineStart: "",
            maybeInsertedLineEnd: "" */
        };
    contextCaches[id] = context;
    return context;
 }

function getWrapped(selection, selected, opening, closing) {
    const rowDiff = selection.end.row - selection.start.row;
    return {
        text: opening + selected + closing,
        selection: [
            0,
            selection.start.column + 1,
            rowDiff,
            selection.end.column + (rowDiff ? 0 : 1)
        ]
    };
}

function getCharAt(editor, session, index) {
    const cursor = editor.getCursorPosition();
    const line = session.doc.getLine(cursor.row);
    let column = cursor.column;
    if(index === -1 ) {
        let lastChar = line[--column];
        while(lastChar===' ' && column > 0)
            lastChar = line[--column];
        return lastChar;
    } else if(index > 0) {
        let lastChar;
        while(index-->0) {
            lastChar = line[column];
            while (lastChar === ' ' && column < line.length)
                lastChar = line[++column];
        }
        return lastChar;
    }
}

const LEFT_RIGHT = {'"' : '"', "'" : "'", '(' : ')', '{' : '}', '[' : ']'};
const RIGHT_LEFT = {'"' : '"', "'" : "'", ')' : '(', '}' : '{', ']' : '['};

export default // noinspection JSUnresolvedVariable
class PromptoBehaviour extends window.ace.acequire("ace/mode/behaviour").Behaviour {

    constructor(options) {
        super(options);
        this.add("newline", "insertion", this.onNewLineInsertion.bind(this));
        this.add("enclosing", "insertion", this.onEnclosingInsertion.bind(this));
        this.add("enclosing", "deletion", this.onEnclosingDeletion.bind(this));
        this.add("tag", "insertion", this.onTagInsertion.bind(this));
        this.add("tag", "deletion", this.onTagDeletion.bind(this));
    }

    // noinspection JSMethodCanBeStatic
    onNewLineInsertion(state, action, editor, session, text) {
        if(text==='\n') {
            const tabString = session.getTabString();
            const cursor = editor.getCursorPosition();
            const line = session.doc.getLine(cursor.row);
            const indent = line.match(/^\s*/)[0];
            const lastChar = getCharAt(editor, session, -1);
            const dialect = session.getMode().$dialect;
            if(dialect==="O" && lastChar==='{') {
                const nextChar = getCharAt(editor, session, +1);
                if(nextChar==="}") {
                    const start = (indent + tabString).length;
                    return {
                        text: text + indent + tabString + text + indent,
                        selection: [1, start, 1, start]
                    };
                } else {
                    const start = (indent + tabString).length;
                    return {
                        text: text + indent + tabString,
                        selection: [1, start, 1, start]
                    };
                }
            } else if(dialect!=="O" && lastChar===':') {
                const start = (indent + tabString).length;
                return {
                    text: text + indent + tabString,
                    selection: [1, start, 1, start]
                };
            } else  {
                const nextChar = getCharAt(editor, session, +1);
                const nextNextChar = getCharAt(editor, session, +2);
                if(lastChar + nextChar + nextNextChar === '></') {
                    const start = (indent + tabString).length;
                    return {
                        text: text + indent + tabString + text + indent,
                        selection: [1, start, 1, start]
                    };
               }
            }
        }
    }

    onEnclosingInsertion(state, action, editor, session, text) {
        if (LEFT_RIGHT[text]) {
            initContext(editor);
            const selection = editor.getSelectionRange();
            const selected = session.doc.getTextRange(selection);
            if (selected !== "" && editor.getWrapBehavioursEnabled()) {
                return getWrapped(selection, selected, text, LEFT_RIGHT[text]);
            } else if (this.isSaneEnclosingInsertion(editor, session)) {
                this.recordAutoInsert(editor, session, LEFT_RIGHT[text]);
                return {
                    text: text + LEFT_RIGHT[text],
                    selection: [1, 1]
                };
            }
        } else if (RIGHT_LEFT[text]) {
            initContext(editor);
            const cursor = editor.getCursorPosition();
            const line = session.doc.getLine(cursor.row);
            const rightChar = line.substring(cursor.column, cursor.column + 1);
            if (rightChar === text) {
                // noinspection JSUnresolvedFunction
                const matching = session.$findOpeningBracket(text, {column: cursor.column + 1, row: cursor.row});
                if (matching !== null && this.isAutoInsertedClosing(cursor, line, text)) {
                    this.popAutoInsertedClosing();
                    return {
                        text: '',
                        selection: [1, 1]
                    };
                }
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    onEnclosingDeletion(state, action, editor, session, range) {
        const selected = session.doc.getTextRange(range);
        if (!range.isMultiLine() && LEFT_RIGHT[selected]) {
            initContext(editor);
            const line = session.doc.getLine(range.start.row);
            const rightChar = line.substring(range.start.column + 1, range.start.column + 2);
            if (rightChar === LEFT_RIGHT[selected]) {
                range.end.column++;
                return range;
            }
        }
    }

    // noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
    isSaneEnclosingInsertion(editor, session) {
        const cursor = editor.getCursorPosition();
        const line = session.doc.getLine(cursor.row);
        const rightChar = line.substring(cursor.column, cursor.column + 1);
        // Only insert in front of whitespace
        return rightChar==="" || ">)}] ".indexOf(rightChar) >= 0;
    }

    recordAutoInsert(editor, session, closing) {
        const cursor = editor.getCursorPosition();
        const line = session.doc.getLine(cursor.row);
        // Reset previous state if text or context changed too much
        if (!this.isAutoInsertedClosing(cursor, line, context.autoInsertedLineEnd[0]))
            context.autoInsertedClosings = 0;
        context.autoInsertedRow = cursor.row;
        context.autoInsertedLineEnd = closing + line.substr(cursor.column);
        context.autoInsertedClosings++;
    }

    // noinspection JSMethodCanBeStatic
    isAutoInsertedClosing(cursor, line, closing) {
        return context.autoInsertedClosings > 0 &&
            cursor.row === context.autoInsertedRow &&
            closing === context.autoInsertedLineEnd[0] &&
            line.substr(cursor.column) === context.autoInsertedLineEnd;
    }

    // noinspection JSMethodCanBeStatic
    popAutoInsertedClosing() {
        context.autoInsertedLineEnd = context.autoInsertedLineEnd.substr(1);
        context.autoInsertedClosings--;
    }

    // noinspection JSMethodCanBeStatic
    onTagInsertion(state, action, editor, session, text) {
        const range = editor.getSelectionRange();
        if(range.start.row !== range.end.row)
            return;
        let tag;
        if((tag = this.getTagBeingCreated(editor, session, text)) != null) {
            // auto insert closing tag
            return {
                text: '></' + tag + '>',
                selection: [1, 1]
            };
        } else if(this.isValidTagNameCharacter(text) && (tag = this.getTagBeingEdited(editor, session))!= null) {
            // auto update closing tag
            const locator = new TagLocator(session.doc.getAllLines());
            const closing = locator.locateClosingTagOf(tag);
            if(closing) {
                const relative_column = range.start.column - tag.location.column - tag.fullTag.indexOf(tag.tagName);
                if(range.end.column === range.start.column) {
                    const position = {
                        row: closing.location.row,
                        column: closing.location.column + closing.fullTag.indexOf(tag.tagName) + relative_column // use tag.tagName to skip '/'
                    };
                    session.insert(position, text);

                } else {
                    const column = closing.location.column + closing.fullTag.indexOf(tag.tagName) + relative_column; // use tag.tagName to skip '/'
                    const target = {
                        start: {
                            row: closing.location.row,
                            column: column
                        },
                        end: {
                            row: closing.location.row,
                            column: column + range.end.column - range.start.column
                        }
                    }
                    session.replace(target, text);
                }
            }
        }
    }

    onTagDeletion(state, action, editor, session, range) {
        if(range.start.row !== range.end.row)
            return;
        let tag;
        if((tag = this.getTagBeingEdited(editor, session))!= null) {
            const locator = new TagLocator(session.doc.getAllLines());
            const closing = locator.locateClosingTagOf(tag);
            if (closing) {
                const relative_column = range.start.column - tag.location.column - tag.fullTag.indexOf(tag.tagName);
                const target = {
                    start: {
                        row: closing.location.row,
                        column: closing.location.column + closing.fullTag.indexOf(tag.tagName) + relative_column
                    },
                    end: {
                        row: closing.location.row,
                        column: closing.location.column + closing.fullTag.indexOf(tag.tagName) + relative_column + range.end.column - range.start.column
                    }
                };
                session.remove(target);
            }
        }
     }

    isValidTagNameCharacter(text) {
        return text.match(/[a-zA-Z-]/);
    }

    getTagBeingCreated(editor, session, text) {
        if (text !== '>')
            return null;
        const cursor = editor.getCursorPosition();
        const section = session.doc.getLine(cursor.row).substring(0, cursor.column) + text;
        const locator = new TagLocator([section]);
        const location = locator.locateTagAt({ row: 0, column: cursor.column}, true);
        return location == null ? null : location.tagName;
    }

    getTagBeingEdited(editor, session) {
        const cursor = editor.getCursorPosition();
        const locator = new TagLocator(session.doc.getAllLines());
        return locator.locateTagAt(cursor);
    }

}
