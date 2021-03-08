import "../src/PropTypesPatcher.js";
import PropertyConverter from "../src/PropertyConverter.js";
import { OverlayTrigger, Navbar } from "react-bootstrap";

let converter = new PropertyConverter(OverlayTrigger);
let converted = converter.convertOne("animation");
console.log("OverlayTrigger.animation : " + converted.toString());

converter = new PropertyConverter(Navbar.ControlledComponent);
converted = converter.convertOne("fluid");
console.log("Navbar.fluid : " + converted.toString());
