import PropTypes from "introspective-prop-types";
import PropertyConverter from "../src/PropertyConverter";
import { elementType } from "prop-types";
import {DEFAULT_HELPERS} from "../src/DefaultHelpers";

class Widget {}

Widget.propTypes = {
    _bool: PropTypes.bool,
    _string: PropTypes.string,
    _number: PropTypes.number,
    _type: PropTypes.oneOf(['button', 'reset', 'submit']),
    _element: elementType,
    onClick: PropTypes.func,
};

Widget.defaultProps = {
    _bool: false,
    _type: 'button'
};


it("converts a boolean property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_bool");
    expect(converted.toString()).toEqual("Boolean");
});

it("converts a string property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_string");
    expect(converted.toString()).toEqual("Text");
});

it("converts a number property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_number");
    expect(converted.toString()).toEqual("Integer");
});

it("converts a oneOf property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_type");
    expect(converted.toString()).toEqual('{ values: <"button", "reset", "submit">, required: false }');
});

it("converts an elementType property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("_element");
    expect(converted.toString()).toEqual('Text');
});

it("converts an onClick property", () => {
    const converter = new PropertyConverter(Widget, DEFAULT_HELPERS);
    const converted = converter.convertOne("onClick");
    expect(converted.toString()).toEqual('ClickEventCallback');
});