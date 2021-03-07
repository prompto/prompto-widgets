import "../src/PropTypesPatcher.js";
import PropertyConverter from "../src/PropertyConverter.js";
import { OverlayTrigger } from "react-bootstrap";

const converter = new PropertyConverter(OverlayTrigger);
const converted = converter.convertOne("animation");
console.log(converted.toString());