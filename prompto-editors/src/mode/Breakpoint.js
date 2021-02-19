export default class Breakpoint {

    constructor(active) {
        this.active = !!active;
    }

    getType() {
        return "Breakpoint";
    }

    equals(other) {
        return false;
    }

    matchesContent(content) {
        return false;
    }

    matchesLine(line) {
        return false;
    }
}