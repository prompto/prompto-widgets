export default class PromptoHighlightRules extends window.ace.acequire(
    "ace/mode/text_highlight_rules"
).TextHighlightRules {

    constructor() {
        super();

        const controls = (
            "always|break|case|catch|default|do|each|else|except|finally|for|from|if|" +
            "on|otherwise|raise|return|switch|then|throw|to|try|with|when|where|while"
        );

        const types = (
            "Java|C#|Python2|Python3|JavaScript|Swift|Any|Blob|Boolean|Character|Text|" +
            "Image|Integer|Decimal|Date|Time|DateTime|Period|Method|Code|Document|Html|" +
            "attr|attribute|attributes|bindings|enum|category|class|getter|" +
            "method|methods|operator|resource|setter|singleton|test|widget"
        );

        const modifiers = (
            "abstract|desc|descending|enumerated|extends|mutable|native|storable"
        );

        const operators = (
            "and|in|is|modulo|not|or"
        );

        const other = (
            "all|any|as|contains|def|define|doing|expecting|" +
            "index|matching|receiving|returning|verifying"
        );

        const functions = (
            "write|read|open|execute|invoke|pass|fetch|flush|sorted|store"
        );

        const constants = (
            "True|true|False|false|None|Nothing|nothing|null|self|this"
        );

        const keywordMapper = this.createKeywordMapper({
            "keyword.control": controls,
            "keyword.operator": operators,
            "keyword.other": other,
            "storage.type": types,
            "storage.modifier": modifiers,
            "support.function": functions,
            "constant.language": constants
        }, "identifier");

        this.$rules = {
            start: [
                {
                    token : "comment",
                    regex : "\\/\\/.*\\n"
                },
                {
                    token : "string", // text literal
                    regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
                },
                {
                    token : "string", // date, time, character...
                    regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
                },
                {
                    token: keywordMapper,
                    regex: "C#|[a-zA-Z][a-zA-Z0-9]*\\b"
                },
                {
                    token : "constant.numeric", // hex
                    regex : "0[xX][0-9a-fA-F]+\\b"
                },
                {
                    token: "constant.numeric", // float
                    regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
                },
                {
                    token : "keyword.operator",
                    regex : "!|%|\\\\|/|\\*|\\-|\\+|~=|==|<>|!=|<=|>=|=|<|>|&&|\\|\\|"
                },
                {
                    token : "punctuation.operator",
                    regex : "\\?|\\:|\\,|\\;|\\."
                },
                {
                    token : "paren.lparen",
                    regex : "[[({]"
                },
                {
                    token : "paren.rparen",
                    regex : "[\\])}]"
                },
                {
                    token : "text",
                    regex : "\\s+"
                }
            ]
        };
    }
}