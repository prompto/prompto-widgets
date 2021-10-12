// to run this script you must go through the following steps
// from the widget-library-generator project, run 'npm link'
// this will publish the widget-library-generator package on your box
// from the react-bootstrap project, use the 'do-not-strip-prototypes' branch, then run 'npm link' (also uses a different package name)
// this will publish the patched react-bootstrap package on your box
// then from this project, run 'npm link widget-library-generator react-bootstrap'

import * as WLG from 'widget-library-generator';
const { PropTypes, PropTypesExtra, TypeProperty, TypeSetProperty, ValueSetProperty, WidgetLibraryGenerator } = WLG;
import React from 'react';
import ReactDOM from 'react-dom';
import { default as ReactBootstrap } from 'react-bootstrap';

const Any = propType => new TypeProperty("Any");
const Boolean = propType => new TypeProperty("Boolean");
const Text = propType => new TypeProperty("Text");
const Date = propType => new TypeProperty("Date");
const Html = propType => new TypeProperty("Html");
const Htmls = propType => new TypeProperty("Html[]");
const Document = propType => new TypeProperty("Document");
const Callback = propType => new TypeProperty("Callback");
const AnyCallback = propType => new TypeProperty("AnyCallback");
const BooleanCallback = propType => new TypeProperty("BooleanCallback");
const IntegerCallback = propType => new TypeProperty("IntegerCallback");
const WidgetCallback = propType => new TypeProperty("WidgetCallback");
const DateChangedCallback = propType => new TypeProperty("DateChangedCallback");
const ToggleChangedCallback = propType => new TypeProperty("ToggleChangedCallback");
const ItemSelectedCallback = propType => new TypeProperty("ItemSelectedCallback");

/* fix miising properties due to usage of uncontrollable */

ReactBootstrap.DropdownButton.propTypes = { ...ReactBootstrap.Dropdown.ControlledComponent.propTypes, ...ReactBootstrap.DropdownButton.propTypes };

const HELPERS = {
    "*": {
        children: Htmls,
        componentClass: propType => new TypeSetProperty(["Text", "Type<ReactWidget>"], true),
        expanded: Boolean,
        defaultExpanded: Boolean,
        transition: Text,
        backdropTransition: Text,
        open: Boolean,
        defaultOpen: Boolean,
        activeKey: Any,
        defaultActiveKey: Any,
        value: Any,
        defaultValue: Any,
        onSelect: ItemSelectedCallback
    },
    Modal: {
        onEscapeKeyUp: Callback,
        dialogComponentClass: Text,
        container: Any
    },
    MenuItem: {
        divider: Boolean
    },
    ButtonGroup: {
        block: Boolean
    },
    DatePicker: {
        minDate: Date,
        defaultValue: Date,
        value: Date,
        onChange: DateChangedCallback,
        maxDate: Date,
        dayLabels: propType => new TypeProperty("Text[]"),
        monthLabels: propType => new TypeProperty("Text[]")
    },
    Typeahead: {
        inputProps: Document,
        bsSize: propType => new ValueSetProperty(['large', 'lg', 'sm', 'small']),
        caseSensitive: Boolean,
        defaultInputValue: Text,
        highlightOnlyResult: Boolean,
        ignoreDiacritics: Boolean,
        labelKey: propType => new TypeSetProperty(["Text", "TypeaheadLabelCallback"], true),
        selected: propType => new TypeSetProperty(["Text[]", "Any[]"], true),
        onChange: propType => new TypeProperty("TypeaheadSelectionChangedCallback"),
        onIputChange: propType => new TypeProperty("InputChangedEventCallback")
    },
    OverlayTrigger : {
        trigger: Any // TODO support inline enum array, was: <<"click", "hover", "focus">, <"click", "hover", "focus">[], null>
    },
    ProgressBar : {
        children: Htmls
    },
    Panel: {
        onToggle: ToggleChangedCallback
    },
    Navbar: {
        onToggle: ToggleChangedCallback
    },
    Nav: {
        justified: Boolean
    },
    Dropdown: {
        onToggle: AnyCallback // function(Boolean isOpen, Object event, { String source }) {}
    },
    FormControl: {
        inputRef: WidgetCallback
    },
    Checkbox: {
        inputRef: WidgetCallback
    },
    Radio: {
        inputRef: WidgetCallback
    },
    ToggleButtonGroup: {
        onChange: AnyCallback
    },
    ToggleButton: {
        onChange: AnyCallback
    }
};

const DECLARATIONS = [
`native method clearTypeahead (Any typeahead) {
    JavaScript: typeahead.clear();
}
`,
`abstract Text method TypeaheadLabelCallback(Any value);
`,
`abstract method TypeaheadSelectionChangedCallback(Any[] values);
`
];

// add missing propTypes
ReactBootstrap.FormControl.propTypes.onChange = PropTypes.func;
ReactBootstrap.Panel.propTypes.onSelect = PropTypes.func;
ReactBootstrap.Pagination.propTypes.onSelect = PropTypes.func;
// fix missing wrapped propTypes issue
ReactBootstrap.NavDropdown.propTypes = Object.assign({}, ReactBootstrap.Dropdown.ControlledComponent.propTypes, ReactBootstrap.NavDropdown.propTypes);

// fix wrapped component issue
function classResolver(klass) {
    // react-bootstrap 3 uses 'uncontrollable'
    const wrapped = klass.ControlledComponent || null;
    if(wrapped) {
        // copy missing props
        ["onChange", "onSelect", "onToggle"].forEach(name => {
            const prop = klass.propTypes[name];
            if(prop)
                wrapped.propTypes[name] = prop;
        })
        return wrapped;
    } else
        return klass;
}

const projectDir = "project/";
if(typeof window === 'undefined') {
    global["window"] = {};
    global["React"] = React;
    global["ReactDOM"] = ReactDOM;
    global["PropTypes"] = PropTypes;
    global["PropTypesExtra"] = PropTypesExtra;
    global["ReactBootstrap"] = ReactBootstrap;
    import('../project/main.js').then(() => {
            const generator = new WidgetLibraryGenerator(projectDir, ReactBootstrap, HELPERS, DECLARATIONS, classResolver);
            generator.generateLibrary("library/");
        }
    )
}
