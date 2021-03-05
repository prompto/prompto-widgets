import PropertyConverter from "./PropertyConverter.js";

export default class ArrayTypeProperty {

    constructor(itemType) {
        this.itemType = itemType;
        this.prop = PropertyConverter.convertTypeToProp(itemType)
    }

    toString(options) {
        return (this.prop ? this.prop.toString(options) : "Any") + "[]";
    }

}