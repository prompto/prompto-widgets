import PropertyConverter from "./PropertyConverter.js";

export default class ArrayTypeProperty {

    constructor(itemType) {
        this.itemType = itemType;
        this.prop = PropertyConverter.convertTypeToProp(itemType)
    }

    toString(options) {
        options = options ? Object.assign({}, options, { array: true }) : { array: true };
        return this.prop ? this.prop.toString(options) : "Any[]";
    }

}