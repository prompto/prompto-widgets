export default class ValueSetProperty {

    constructor(values) {
        this.values = values;
    }

    toString(required) {
        return "{ values: <" + this.values.map(this.valueToString).join(", ") + ">, required: " + (required || false) + " }";
    }

    valueToString(value) {
        if(value === null)
            return "null";
        else if(typeof(value) === typeof(""))
            return '"' + value + '"';
        else if(value.toString)
            return value.toString();
        else
            return "" + value;
    }
}