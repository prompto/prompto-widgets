import "../src/PropTypesPatcher";
import { Button } from "react-bootstrap";
import WidgetGenerator from "../src/WidgetGenerator";
import {HELPERS} from "../src/ReactBootstrap3Helpers";

function purify(value) {
    return value.replace(/ \t\n/g, "");
}

it("generates a Button widget", () => {
    const generator = new WidgetGenerator(Button, HELPERS);
    let generated = generator.generate("Button", "ReactBootstrap.Button");
    let expected = `@WidgetProperties({ active: Boolean, block: Boolean, bsClass: Text, bsSize: { values: <"lg", "large", "sm", "small", "xs", "xsmall">, required: false }, bsStyle: { values: <"success", "warning", "danger", "info", "default", "primary", "link">, required: false }, componentClass: Text, disabled: Boolean, href: Text, onClick: ClickEventCallback, type: { values: <"button", "reset", "submit">, required: false } })
native widget Button {

    category bindings {
        JavaScript: ReactBootstrap.Button;
    }
    
    Html method render () {
        JavaScript: return this.render();
    }

}
`;
    generated = purify(generated);
    expected = purify(expected);
    expect(generated).toEqual(expected);
});