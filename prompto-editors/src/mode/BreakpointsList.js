/* holds breakpoints in memory in the format required by the debugger and the prompto worker */
export default class BreakpointsList {

    constructor(breakpoints) {
        this.use(breakpoints);
    }

    use(breakpoints) {
        this.breakpoints = breakpoints || [];
    }

    register(breakpoint, set) {
        const idx = this.breakpoints.findIndex(item => item.equals(breakpoint));
        if(idx<0)
            this.breakpoints.push(breakpoint);
        else if (!set)
            this.breakpoints.splice(idx, 1);
    }

    all() {
        return this.breakpoints;
    }

    matchingContent(content) {
        return this.breakpoints.filter(brkpt => brkpt.matchesContent(content));
    }

    matchingLine(line) {
        return this.breakpoints.filter(brkpt => brkpt.matchesLine(line));
    }
}