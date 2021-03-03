import PropTypes from "introspective-prop-types";

/*
import Module from "module";
const require = Module.prototype.require;
Module.prototype.require = function(id) {
    if(id === "prop-types")
        return PropTypes;
    else
        return require(id);
};
*/

// noinspection PointlessBooleanExpressionJS
if(typeof(jest) !== typeof(undefined))  {
    jest.setMock("prop-types", PropTypes);
}



