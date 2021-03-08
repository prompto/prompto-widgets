import TypeProperty from "./TypeProperty.js";

export const DEFAULT_HELPERS = {
    onClick: propType => new TypeProperty("ClickEventCallback"),
    onChange: propType => new TypeProperty("InputChangedEventCallback"),
    onMouseEnter: propType => new TypeProperty("MouseEventCallback"),
    onMouseOver: propType => new TypeProperty("MouseEventCallback"),
    onMouseOut: propType => new TypeProperty("MouseEventCallback"),
    onMouseLeave: propType => new TypeProperty("MouseEventCallback"),
    onKeyDown: propType => new TypeProperty("KeyboardEventCallback"),
    onLoad: propType => new TypeProperty("Callback"),
    onEnter: propType => new TypeProperty("Callback"),
    onEntering: propType => new TypeProperty("Callback"),
    onEntered: propType => new TypeProperty("Callback"),
    onExit: propType => new TypeProperty("Callback"),
    onExiting: propType => new TypeProperty("Callback"),
    onExited: propType => new TypeProperty("Callback"),
    onClose: propType => new TypeProperty("Callback"),
    onHide: propType => new TypeProperty("Callback"),
    onDismiss: propType => new TypeProperty("Callback"),
    onBlur: propType => new TypeProperty("Callback"),
    onFocus: propType => new TypeProperty("Callback"),
    onError: propType => new TypeProperty("Callback"),
    innerRef: propType => new TypeProperty("WidgetCallback"),
    ref: propType => new TypeProperty("WidgetCallback"),
    id: propType => new TypeProperty("Text")
};

