export default class TypeProperty {

    constructor(name) {
        this.name = name;
    }

    toString(options) {
        if(options && options.required && !options.asElement)
            return "{ type: " + this.name + ", required: true }";
        else
            return this.name;
    }
}