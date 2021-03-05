import PropertyConverter from "./PropertyConverter.js";

export default class ObjectTypeProperty {

    constructor(itemType) {
        this.itemType = itemType;
        this.prop = PropertyConverter.convertTypeToProp(itemType)
    }

    toString(options) {
        return "Any"; // TODO
    }

}