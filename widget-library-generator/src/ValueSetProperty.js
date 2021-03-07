import SetProperty from "./SetProperty.js";

export default class ValueSetProperty extends SetProperty {

    constructor(values) {
        super(values);
    }

    toString(options) {
        return "<" + this.values.map(this.valueToString).join(", ") + ">";
    }

    valueToString(value) {
        if(value === null)
            return "null";
        else if(typeof(value) === typeof(""))
            return '"' + value + '"';
        else if(value && value.toString)
            return value.toString();
        else
            return "" + value;
    }
}