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

    equals(other) {
        return this === other ||
            (other instanceof LineBreakpoint &&
                this.categoryName === other.categoryName &&
                this.methodName === other.methodName &&
                this.methodProto === other.methodProto &&
                this.methodLine === other.methodLine &&
                this.statementLine === other.statementLine);
    }

    matchesContent(content) {
        switch(content.type) {
            case "MethodRef":
                return this.matchesGlobalMethodRef(content);
            case "CategoryRef":
                return this.matchesCategoryRef(content);
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

}