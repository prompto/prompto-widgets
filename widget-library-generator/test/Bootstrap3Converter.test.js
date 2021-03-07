import "../src/PropTypesPatcher";
import PropertyConverter from "../src/PropertyConverter";
import { Button, Col, OverlayTrigger } from "react-bootstrap";

const secret = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";

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
    const converter = new PropertyConverter(Button);
    const converted = converter.convertOne("bsSize");
    expect(converted.toString()).toEqual('<"lg", "large", "sm", "small", "xs", "xsmall">');
});

it("converts an elementType property", () => {
    const converter = new PropertyConverter(Button);
    const converted = converter.convertOne("componentClass");
    expect(converted.toString()).toEqual('Text');
});

it("converts a oneOf property without helper", () => {
    const converter = new PropertyConverter(Button);
    const converted = converter.convertOne("type");
    expect(converted.toString()).toEqual('<"button", "reset", "submit">');
});

it("converts a PropTypesExtra componentOrElement", () => {
    const converter = new PropertyConverter(OverlayTrigger);
    const converted = converter.convertOne("animation");
    expect(converted.toString()).toEqual('<Boolean, Text>');
});

it("removes PropTypes.oneOf([null])", () => {
    const converter = new PropertyConverter(OverlayTrigger);
    const converted = converter.convertOne("show");
    expect(converted).toBeNull();
});
