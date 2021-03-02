import "../src/PropTypesPatcher";
import * as ReactBootstrap from "react-bootstrap";
import { HELPERS } from "../src/ReactBootstrap3Helpers";
import WrapperGenerator from "../src/WrapperGenerator";
import fs from 'fs';

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