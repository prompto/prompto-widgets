import PropTypes, { PropTypesExtra } from "introspective-prop-types";

import Module from "module";
const require = Module.prototype.require;
Module.prototype.require = function(id) {
    if(id === "prop-types")
        return PropTypes;
    else if(id === "prop-types-extra")
        return PropTypesExtra;
    else if(id.startsWith("prop-types-extra/lib/")) {
        const what = id.substring("prop-types-extra/lib/".length);
        if(what.indexOf("/") >= 0) // only override top level functions
            return require.bind(this)(id);
        else
            return PropTypesExtra[what];
    } else
        return require.bind(this)(id);
};

// noinspection PointlessBooleanExpressionJS
if(typeof(jest) !== typeof(undefined))  {
    jest.setMock("prop-types", PropTypes);
    jest.setMock("prop-types-extra", PropTypesExtra);
    jest.setMock("prop-types-extra/lib/all", PropTypesExtra.all);
    jest.setMock("prop-types-extra/lib/elementType", PropTypesExtra.elementType);
    jest.setMock("prop-types-extra/lib/componentOrElement", PropTypesExtra.componentOrElement);
    jest.setMock("prop-types-extra/lib/deprecated", PropTypesExtra.deprecated);
    jest.setMock("prop-types-extra/lib/isRequiredForA11y", PropTypesExtra.isRequiredForA11y);
}

export { PropTypes, PropTypesExtra };

