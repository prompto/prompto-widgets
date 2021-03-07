import "../src/PropTypesPatcher";
import { Button } from "react-bootstrap";
import WidgetGenerator from "../src/WidgetGenerator";
import { DEFAULT_HELPERS } from "../src/DefaultHelpers";

function purify(value) {
    return value.replace(/ \t\n/g, "");
}

it("generates a Button widget", () => {
    const generator = new WidgetGenerator("Button", Button, DEFAULT_HELPERS);
    let generated = generator.generate("Button", "ReactBootstrap.Button");
    let expected = `@WidgetProperties({ active: Boolean, block: Boolean, bsClass: Text, bsSize: <"lg", "large", "sm", "small", "xs", "xsmall">, bsStyle: <"success", "warning", "danger", "info", "default", "primary", "link">, componentClass: Text, disabled: Boolean, href: Text, onClick: ClickEventCallback, type: <"button", "reset", "submit"> })
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