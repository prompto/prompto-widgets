export default class Breakpoint {

    constructor(active) {
        this.active = !!active;
    }

    equals(other) {
        return false;
    }

    matchesContent(content) {
        return false;
    }
 }