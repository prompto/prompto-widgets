import SetProperty from "./SetProperty.js";
import PropertyConverter from "./PropertyConverter.js";

export default class TypeSetProperty extends SetProperty {

    constructor(values) {
        super(values);
        this.types = values.map(value => PropertyConverter.convertTypeToProp(value));
    }

    toString(options) {
        return "<" + this.types.map(type => type ? type.toString({asElement: true}) : "null").join(", ") + ">";
    }

}