import PropTypes from "introspective-prop-types";
import * as PropTypesExtra from "prop-types-extra";
import TypeProperty from "./TypeProperty.js";
import RequiredProperty from "./RequiredProperty.js";
import ValueSetProperty from "./ValueSetProperty.js";
import TypeSetProperty from "./TypeSetProperty.js";
import ArrayTypeProperty from "./ArrayTypeProperty.js";
import ObjectTypeProperty from "./ObjectTypeProperty.js";

export default class PropertyConverter {

    constructor(klass, helpers) {
        this.propTypes = klass.propTypes || {};
        this.defaultProps = klass.defaultProps || {};
        this.helpers = helpers || {};
    }

    convertOne(name) {
        const propType = this.propTypes[name] || null;
        if (propType === null)
            return null;
        else if (this.helpers[name])
            return this.helpers[name](propType);
        else
            return this.doConvertOne(propType, name);
    }

    doConvertOne(propType, name) {
        const prop = PropertyConverter.convertTypeToProp(propType);
        return prop ? this.makeRequired(prop, propType, name) : null;
    }

    makeRequired(prop, propType, name) {
        if(propType.required && !this.defaultProps.hasOwnProperty(name))
            return new RequiredProperty(prop);
        else
            return prop;
    }

    static convertTypeToProp(propType) {
        if(propType === PropTypes.any  || propType.type === "any")
            return new TypeProperty("Any");
        else if(propType === PropTypes.array  || propType.type === "array")
            return new TypeProperty("Any[]");
        else if(propType === PropTypes.bool  || propType.type === "bool")
            return new TypeProperty("Boolean");
        else if(propType === PropTypes.func || propType.type === "func")
            return new TypeProperty("Callback");
        else if(propType === PropTypes.number || propType.type === "number")
            return new TypeProperty("Integer");
        else if(propType === PropTypes.object || propType.type === "object")
            return new TypeProperty("Any");
        else if(propType === PropTypes.string || propType.type === "string")
            return new TypeProperty("Text");
        else if(propType === PropTypes.node || propType.type === "node")
            return new TypeProperty("Any"); // TODO for now
        else if(propType === PropTypes.element || propType.type === "element")
            return new TypeProperty("Html");
        else if(propType === PropTypes.symbol || propType.type === "symbol")
            return new TypeProperty("Any");
        else if(propType === PropTypes.elementType || propType === PropTypesExtra.elementType || propType.type === "elementType")
            return new TypeProperty("Text");
        else if(propType.type === "instanceOf")
            return new TypeProperty("Any"); // TODO for now (could create a new syntax for "is a")
        else if(propType.type === "oneOf")
            return new ValueSetProperty(propType.arg);
        else if(propType.type === "oneOfType")
            return new TypeSetProperty(propType.arg);
        else if(propType.type === "arrayOf")
            return new ArrayTypeProperty(propType.arg);
        else if(propType.type === "objectOf")
            return new ObjectTypeProperty(propType.arg);
        else if(propType.type === "shape")
            return new TypeProperty("Any"); // TODO for now (could create an inline type)
        else if(propType.type === "exact")
            return new TypeProperty("Any"); // TODO for now (could create an inline type)
        else
            return null;
    }

}