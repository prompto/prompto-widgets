import React from "react";
import PropTypes from "introspective-prop-types";
import PropertyConverter from "../src/PropertyConverter";
import {DEFAULT_HELPERS} from "../src/DefaultHelpers";
import { fetchPropTypesAndDefaultProps } from "../src/BackwardRef";

class Widget {}

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
    _instanceOf: PropTypes.instanceOf(React.Component),
    _oneOf: PropTypes.oneOf(['button', 'reset', 'submit']),
    _oneOfType: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    _arrayOf: PropTypes.arrayOf(PropTypes.string),
    _objectOf: PropTypes.objectOf(PropTypes.string),
    _shape: PropTypes.shape({color: PropTypes.string, fontSize: PropTypes.number }),
    _exact: PropTypes.exact({color: PropTypes.string, fontSize: PropTypes.number }),
    _required: PropTypes.bool.isRequired,
    _default: PropTypes.bool.isRequired,
    onClick: PropTypes.func
};

Widget.defaultProps = {
    _default: false
};

class Control extends React.Component { render() { return null; } }

class Wrapped extends React.Component { render() { return null; } }
Wrapped.displayName = "Wrapped";
Wrapped.propTypes = { _bool: PropTypes.bool };
Wrapped.defaultProps = { _bool: true };

const Forwarded = React.forwardRef((props, ref) => React.createElement(Wrapped, Object.assign(props, { ref: ref })));
Forwarded.displayName = Wrapped.displayName;
Forwarded.propTypes = Wrapped.propTypes;
Forwarded.defaultProps = Wrapped.defaultProps;

const Ugly = React.forwardRef((props, ref) => React.createElement(Wrapped, Object.assign(props, { ref: ref })));

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
    expect(converted.toString()).toEqual('<"button", "reset", "submit">');
});

it("converts a oneOfType property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_oneOfType");
    expect(converted.toString()).toEqual('<Text, Integer>');
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

it("converts a helper property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("onClick");
    expect(converted.toString()).toEqual('ClickEventCallback');
});

it("converts a required property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_required");
    expect(converted.toString()).toEqual('{ type: Boolean, required: true }');
});

it("converts a default property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_default");
    expect(converted.toString()).toEqual('Boolean');
});

it("supports components with no propTypes", () => {
    const klass = fetchPropTypesAndDefaultProps(Control);
    const converter = new PropertyConverter(klass, DEFAULT_HELPERS);
    const converted = converter.convertOne("ref");
    expect(converted).toBeNull();
});

it("reads props from nice forwardRefs", () => {
    const klass = fetchPropTypesAndDefaultProps(Forwarded);
    const converter = new PropertyConverter(klass, DEFAULT_HELPERS);
    const converted = converter.convertOne("_bool");
    expect(converted.toString()).toEqual("Boolean");
});

it("reads props from ugly forwardRefs", () => {
    const klass = fetchPropTypesAndDefaultProps(Ugly);
    const converter = new PropertyConverter(klass, DEFAULT_HELPERS);
    const converted = converter.convertOne("_bool");
    expect(converted.toString()).toEqual("Boolean");
});