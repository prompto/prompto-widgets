import LineBreakpoint from "./LineBreakpoint";

export default class BreakpointFactory {

    static fromInstance(brkpt) {
        const type = Object.getPrototypeOf(brkpt).constructor;
        let result = null;
        if (type.name === "LineBreakpoint")
            result = new LineBreakpoint();
        if (result)
            Object.getOwnPropertyNames(result).forEach(name => result[name] = brkpt[name]);
        return result;
    }

    static fromObject(obj) {
        let result = null;
        if (obj.type === "LineBreakpoint")
            result = new LineBreakpoint();
        if (result)
            Object.getOwnPropertyNames(result).forEach(name => result[name] = obj.value[name]);
        return result;
    }

}

