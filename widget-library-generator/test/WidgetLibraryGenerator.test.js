import "../src/PropTypesPatcher";
import PropTypes from "introspective-prop-types";
import * as ReactBootstrap from "react-bootstrap";
import WidgetLibraryGenerator from "../src/WidgetLibraryGenerator";
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

it("uses the proper helpers", () => {
    const LIBRARY = {
        Button: { propTypes: { onClick: PropTypes.func, onHover:  PropTypes.func } },
        Image: { propTypes: { onClick: PropTypes.func, onHover:  PropTypes.func } }
    }
    const projectDir = "samples/rbs3/";
    const generator = new WidgetLibraryGenerator(projectDir, LIBRARY, HELPERS);
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
    const wrapper = new WidgetLibraryGenerator(projectDir, ReactBootstrap, HELPERS);
    const libraryDir = "generated/rbs3/";
    wrapper.generateLibrary(libraryDir);
    expect(fs.existsSync(libraryDir + "module.json")).toBeTruthy();
    expect(fs.existsSync(libraryDir + "main.js")).toBeTruthy();
    expect(fs.existsSync(libraryDir + "stub.js")).toBeTruthy();
    expect(fs.existsSync(libraryDir + "widgets.poc")).toBeTruthy();
});

it("renames if required", () => {
    const projectDir = "samples/rbs3/";
    const generator = new WidgetLibraryGenerator(projectDir, ReactBootstrap, HELPERS, null);
    const libraryDir = "generated/rbs3/";
    generator.generateLibrary(libraryDir);
    const prompto = fs.readFileSync(libraryDir + "widgets.poc", {encoding:'utf8', flag:'r'});
    expect(prompto).toContain("XButton");
});
