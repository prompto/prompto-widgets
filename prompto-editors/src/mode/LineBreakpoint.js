import Breakpoint from "./Breakpoint";

export default class LineBreakpoint extends Breakpoint {

    constructor(categoryName, methodName, methodProto, methodLine, statementLine, active) {
        super(active);
        this.categoryName = categoryName;
        this.methodName = methodName;
        this.methodProto = methodProto;
        this.methodLine = methodLine;
        this.statementLine = statementLine;
    }

    getType() {
        return "LineBreakpoint";
    }

    equals(other) {
        return this === other ||
            (other instanceof LineBreakpoint &&
                this.categoryName === other.categoryName &&
                this.methodName === other.methodName &&
                this.methodProto === other.methodProto &&
                this.methodLine === other.methodLine &&
                this.statementLine === other.statementLine);
    }

    matchesLine(line) {
        return this.statementLine === line;
    }

    matchesContent(content) {
        switch(content.type) {
            case "MethodRef":
                return this.matchesGlobalMethodRef(content);
            case "CategoryRef":
            case "WidgetRef":
                return this.matchesCategoryRef(content);
            case "TestRef":
                return this.matchesTestRef(content);
            default:
                return false;
        }
    }

    matchesGlobalMethodRef(content) {
        return content.name === this.methodName && (content.prototype || "") === (this.methodProto || "");
    }

    matchesCategoryRef(content) {
        return content.name === this.categoryName;
    }

    matchesTestRef(content) {
        return content.name === this.methodName;
    }

}