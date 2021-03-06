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
            } else if (this.isSaneInsertion(editor, session)) {
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
    isSaneInsertion(editor, session) {
        return true;
        /*
        const cursor = editor.getCursorPosition();
        const line = session.doc.getLine(cursor.row);
        const rightChar = line.substring(cursor.column, cursor.column + 1);
        // Only insert in front of whitespace
        return rightChar==="" || rightChar===" ";
        */
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
        if(text==='>') {
            const cursor = editor.getCursorPosition();
            const section = session.doc.getLine(cursor.row).substring(0, cursor.column) + text;
            const matches = section.match(/(<([a-zA-Z][-\w]*)>)/g);
            let tag = matches && matches[matches.length - 1];
            if(tag && section.endsWith(tag)) {
                tag = tag.substring(1, tag.length-1);
                return {
                    text: '></' + tag + '>',
                    selection: [1, 1]
                };
            }
        }
    }

}