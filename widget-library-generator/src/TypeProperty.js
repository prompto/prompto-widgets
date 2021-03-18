export default class TypeProperty {

    constructor(name) {
        this.name = name;
    }

    toString(options) {
        const name = this.name + (options && options.array ? "[]" : "");
        if(options && options.required && !options.asElement)
            return "{ type: " + name + ", required: true }";
        else
            return name;
    }
}