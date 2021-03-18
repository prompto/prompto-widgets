import SetProperty from "./SetProperty.js";
import PropertyConverter from "./PropertyConverter.js";

export default class TypeSetProperty extends SetProperty {

    constructor(values, converted) {
        super(values);
        this.types = converted ? values : values.map(value => PropertyConverter.convertTypeToProp(value));
    }

    toString(options) {
        if(options && options.required && !options.asElement) {
            const arrayOptions = options && options.array ? { array: true } : null;
            return "{ types: " + this.toString(arrayOptions) + ", required: true }";
        } else {
            const itemOptions = options && options.array ? { array: true, asElement: true } : { asElement: true };
            return "<" + this.types.map(type => type ? type.toString(itemOptions) : "null").join(", ") + ">";
        }
    }

}