import "../src/PropTypesPatcher";
import PropTypes from "introspective-prop-types";
import * as ReactBootstrap from "react-bootstrap";
import WrapperGenerator from "../src/WrapperGenerator";
import fs from 'fs';
import TypeProperty from "../src/TypeProperty";

const HELPERS = {
    "*": {
        onHover: propType => new TypeProperty("LibraryCallback")
    },
    Button: {
        onClick: propType => new TypeProperty("SpecificCallback")
    }
};

const LIBRARY = {
    Button: { propTypes: { onClick: PropTypes.func, onHover:  PropTypes.func } },
    Image: { propTypes: { onClick: PropTypes.func, onHover:  PropTypes.func } }
}

it("uses the proper helpers", () => {
    const projectDir = "samples/rbs3/";
    const generator = new WrapperGenerator(projectDir, LIBRARY, HELPERS);
    let helpers = generator.getHelpers("Button");
    expect(helpers.onClick().toString()).toEqual("SpecificCallback");
    expect(helpers.onHover().toString()).toEqual("LibraryCallback");
    expect(helpers.ref().toString()).toEqual("WidgetCallback");
    helpers = generator.getHelpers("Image");
    expect(helpers.onClick().toString()).toEqual("ClickEventCallback");
    expect(helpers.onHover().toString()).toEqual("LibraryCallback");
    expect(helpers.ref().toString()).toEqual("WidgetCallback");
});

it("generates a wrapper", () => {
    const projectDir = "samples/rbs3/";
    const wrapper = new WrapperGenerator(projectDir, ReactBootstrap, HELPERS);
    const libraryDir = "generated/rbs3/";
    wrapper.generateWrapper(libraryDir);
    expect(fs.existsSync(libraryDir + "module.json")).toBeTruthy();
    expect(fs.existsSync(libraryDir + "main.js")).toBeTruthy();
    expect(fs.existsSync(libraryDir + "stub.js")).toBeTruthy();
    expect(fs.existsSync(libraryDir + "widgets.poc")).toBeTruthy();
});