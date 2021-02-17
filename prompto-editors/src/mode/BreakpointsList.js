/* holds breakpoints in memory in the format required by the debugger and the prompto worker */
export default class BreakpointsList {

    constructor(breakpoints) {
        this.breakpoints = [];
        /*this.breakpoints = breakpoints ? breakpoints.map(b=>{
            // eslint-disable-next-line
            const type = eval(b.type);
            const breakpoint = new type();
            return { status: "CLEAN", breakpoint: breakpoint.fromStored(b.value)};
        }) : []; */
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

}