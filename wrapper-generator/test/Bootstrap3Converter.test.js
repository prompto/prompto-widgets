import "../src/PropTypesPatcher";
import PropertyConverter from "../src/PropertyConverter";
import { Button, Col } from "react-bootstrap";
import { HELPERS } from "../src/ReactBootstrap3Helpers";

it("converts a boolean property", () => {
    const converter = new PropertyConverter(Button);
    const converted = converter.convertOne("active");
    expect(converted.toString()).toEqual("Boolean");
});

it("converts a string property", () => {
    const converter = new PropertyConverter(Button);
    const converted = converter.convertOne("href");
    expect(converted.toString()).toEqual("Text");
});

it("converts a number property", () => {
    const converter = new PropertyConverter(Col);
    const converted = converter.convertOne("xsPull");
    expect(converted.toString()).toEqual("Integer");
});

it("converts a property with helper", () => {
    const converter = new PropertyConverter(Button, HELPERS);
    const converted = converter.convertOne("bsSize");
    expect(converted.toString()).toEqual('{ values: <"lg", "large", "sm", "small", "xs", "xsmall">, required: false }');
});

it("converts an elementType property", () => {
    const converter = new PropertyConverter(Button, HELPERS);
    const converted = converter.convertOne("componentClass");
    expect(converted.toString()).toEqual('Text');
});

it("converts a oneOf property without helper", () => {
    const converter = new PropertyConverter(Button, HELPERS);
    const converted = converter.convertOne("type");
    expect(converted.toString()).toEqual('{ values: <"button", "reset", "submit">, required: false }');
});