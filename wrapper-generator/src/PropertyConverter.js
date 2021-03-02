import PropTypes from "introspective-prop-types";
import { componentOrElement, elementType } from "prop-types-extra";
import TypeProperty from "./TypeProperty";
import RequiredProperty from "./RequiredProperty";
import ValueSetProperty from "./ValueSetProperty";

const DEFAULT_HELPERS = {
    onClick: propType => new TypeProperty("ClickEventCallback")
};

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
        else if (DEFAULT_HELPERS[name])
            return DEFAULT_HELPERS[name](propType);
        else
            return this.doConvertOne(propType);
    }

    doConvertOne(propType) {
        const prop = this.convertTypeToProp(propType);
        return this.makeRequired(prop, propType);
    }

    makeRequired(prop, propType) {
        if(propType.required)
            return new RequiredProperty(prop);
        else
            return prop;
    }

    convertTypeToProp(propType) {
        if(propType === PropTypes.bool)
            return new TypeProperty("Boolean");
        else if(propType === PropTypes.string)
            return new TypeProperty("Text");
        else if(propType === PropTypes.number)
            return new TypeProperty("Integer");
        else if(propType === PropTypes.elementType)
            return new TypeProperty("Text");
        else if(propType.type === "oneOf")
            return new ValueSetProperty(propType.arg);
        else if(propType === elementType || propType.name === "elementType" || propType.type === "elementType")
            return new TypeProperty("Text");
        else
            return null;
    }

}