export default class TypeProperty {

    constructor(name) {
        this.name = name;
    }

    toString(required) {
        if(required)
            return "{ type: " + this.name + ", required: true }";
        else
            return this.name;
    }
}