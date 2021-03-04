import PropTypes from "introspective-prop-types";
import PropertyConverter from "../src/PropertyConverter";
import {DEFAULT_HELPERS} from "../src/DefaultHelpers";

class Widget {}

class Control {}

Widget.propTypes = {
    // atomic types
    _any: PropTypes.any,
    _array: PropTypes.array,
    _bool: PropTypes.bool,
    _func: PropTypes.func,
    _number: PropTypes.number,
    _object: PropTypes.object,
    _string: PropTypes.string,
    _node: PropTypes.node,
    _element: PropTypes.element,
    _symbol: PropTypes.symbol,
    _elementType: PropTypes.elementType,
    // composed types
    _instanceOf: PropTypes.instanceOf(Control),
    _oneOf: PropTypes.oneOf(['button', 'reset', 'submit']),
    _oneOfType: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    _arrayOf: PropTypes.arrayOf(PropTypes.string),
    _objectOf: PropTypes.objectOf(PropTypes.string),
    _shape: PropTypes.shape({color: PropTypes.string, fontSize: PropTypes.number }),
    _exact: PropTypes.exact({color: PropTypes.string, fontSize: PropTypes.number }),
    onClick: PropTypes.func
};

Widget.defaultProps = {
    _bool: false,
    _type: 'button'
};

it("converts an any property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_any");
    expect(converted.toString()).toEqual("Any");
});

it("converts an array property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_array");
    expect(converted.toString()).toEqual("Any[]");
});

it("converts a boolean property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_bool");
    expect(converted.toString()).toEqual("Boolean");
});

it("converts a func property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_func");
    expect(converted.toString()).toEqual("Callback");
});

it("converts a number property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_number");
    expect(converted.toString()).toEqual("Integer");
});

it("converts a string property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_string");
    expect(converted.toString()).toEqual("Text");
});

it("converts a node property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_node");
    expect(converted.toString()).toEqual("Any");
});

it("converts an element property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_element");
    expect(converted.toString()).toEqual("Html");
});

it("converts an elementType property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_elementType");
    expect(converted.toString()).toEqual("Text"); // TODO
});

it("converts an instanceOf property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_instanceOf");
    expect(converted.toString()).toEqual("Any"); // TODO
});

it("converts a oneOf property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_oneOf");
    expect(converted.toString()).toEqual('<"button", "reset", "submit", null>');
});

it("converts a oneOfType property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_oneOfType");
    expect(converted.toString()).toEqual('<Text, Integer, null>');
});

it("converts an arrayOf property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_arrayOf");
    expect(converted.toString()).toEqual("Text[]");
});

it("converts an objectOf property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_objectOf");
    expect(converted.toString()).toEqual("Any"); // TODO
});

it("converts a shape property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_shape");
    expect(converted.toString()).toEqual("Any"); // TODO
});

it("converts an exact property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_exact");
    expect(converted.toString()).toEqual("Any"); // TODO
});

it("converts an onClick property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("onClick");
    expect(converted.toString()).toEqual('ClickEventCallback');
});