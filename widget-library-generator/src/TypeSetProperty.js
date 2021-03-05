import SetProperty from "./SetProperty.js";
import PropertyConverter from "./PropertyConverter.js";

export default class TypeSetProperty extends SetProperty {

    constructor(values) {
        super(values);
        this.types = values.map(value => PropertyConverter.convertTypeToProp(value));
    }

    toString(options) {
        const appendNull = this.mustAppendNull(options);
        const types = appendNull ? this.types.concat([null]) : this.types;
        return "<" + types.map(type => type ? type.toString({asElement: true}) : "null").join(", ") + ">";
    }

}