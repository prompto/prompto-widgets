// to run this script you must go through the following steps
// from the widget-library-generator project, run 'npm link'
// this will publish the widget-library-generator package on your box
// from the react-bootstrap project, use the 'do-not-strip-prototypes' branch, then run 'npm link' (also uses a different package name)
// this will publish the patched react-bootstrap package on your box
// then from this project, run 'npm link widget-library-generator react-bootstrap'

import { PropTypes, TypeProperty, ValueSetProperty, WidgetLibraryGenerator } from 'widget-library-generator';
import React from 'react';
import ReactDOM from 'react-dom';
import { default as ReactBootstrap } from 'react-bootstrap';

const Any = propType => new TypeProperty("Any");
const Boolean = propType => new TypeProperty("Boolean");
const Text = propType => new TypeProperty("Text");
const Date = propType => new TypeProperty("Date");
const Html = propType => new TypeProperty("Html");
const Document = propType => new TypeProperty("Document");
const Callback = propType => new TypeProperty("Callback");
const AnyCallback = propType => new TypeProperty("AnyCallback");
const BooleanCallback = propType => new TypeProperty("BooleanCallback");
const IntegerCallback = propType => new TypeProperty("IntegerCallback");
const WidgetCallback = propType => new TypeProperty("WidgetCallback");
const DateChangedCallback = propType => new TypeProperty("DateChangedCallback");
const ToggleChangedCallback = propType => new TypeProperty("ToggleChangedCallback");
const ItemSelectedCallback = propType => new TypeProperty("ItemSelectedCallback");

/* workaround issue where BS4 components created via createWithBsPrefix do not have propTypes */
const BS_PREFIX_HELPER = {
    "%MISSING%": {
        as: Text,
        bsPrefix: Text
    }
};

const HELPERS = {
    "*": {
        componentClass: Text,
        expanded: Boolean,
        defaultExpanded: Boolean,
        transition: Text,
        backdropTransition: Text,
        open: Boolean,
        defaultOpen: Boolean,
        activeKey: Any,
        defaultActiveKey: Any,
        value: Any,
        defaultValue: Any
    },
    Modal: {
        onEscapeKeyUp: Callback,
        dialogComponentClass: Text,
        container: Any
    },
    MenuItem: {
        divider: Boolean,
        onSelect: ItemSelectedCallback
    },
    ButtonGroup: {
        block: Boolean
    },
    DatePicker: {
        minDate: Date,
        defaultValue: Date,
        value: Date,
        onChange: DateChangedCallback,
        maxDate: Date
    },
    Typeahead: {
        inputProps: Document,
        bsSize:   propType => new ValueSetProperty(['large', 'lg', 'sm', 'small'])
    },
    OverlayTrigger : {
        trigger: Any // TODO support inline enum array, was: <<"click", "hover", "focus">, <"click", "hover", "focus">[], null>
    },
    ProgressBar : {
        children: Html
    },
    Panel: {
        onToggle: ToggleChangedCallback
    },
    PanelGroup: {
        onSelect: ItemSelectedCallback
    },
    Navbar: {
        onToggle: ToggleChangedCallback,
        onSelect: ItemSelectedCallback
    },
    NavItem: {
        onSelect: ItemSelectedCallback
    },
    Nav: {
        justified: Boolean,
        onSelect: ItemSelectedCallback
    },
    Tabs: {
        onSelect: ItemSelectedCallback
    },
    DropdownMenu: {
        onSelect: ItemSelectedCallback
    },
    Pagination: {
        onSelect: ItemSelectedCallback
    },
    Dropdown: {
        onToggle: AnyCallback, // function(Boolean isOpen, Object event, { String source }) {}
        onSelect: ItemSelectedCallback
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
    },
    Carousel :{
        onSelect: ItemSelectedCallback
    }

};

const DECLARATIONS = [
`native method clearTypeahead (Any typeahead) {
    JavaScript: typeahead.clear();
}
`
];

ReactBootstrap.FormControl.propTypes.onChange = PropTypes.func;
ReactBootstrap.ToggleButtonGroup.propTypes.onChange = PropTypes.func;

ReactBootstrap.Dropdown.propTypes.onToggle = PropTypes.func;
ReactBootstrap.Panel.propTypes.onToggle = PropTypes.func;

ReactBootstrap.Dropdown.propTypes.onSelect = PropTypes.func;
ReactBootstrap.Panel.propTypes.onSelect = PropTypes.func;
ReactBootstrap.PanelGroup.propTypes.onSelect = PropTypes.func;
ReactBootstrap.Navbar.propTypes.onToggle = PropTypes.func;
ReactBootstrap.Navbar.propTypes.onSelect = PropTypes.func;
ReactBootstrap.Tabs.propTypes.onSelect = PropTypes.func;
ReactBootstrap.Pagination.propTypes.onSelect = PropTypes.func;

const projectDir = "project/";
if(typeof window === 'undefined') {
    global["window"] = {};
    global["React"] = React;
    global["ReactDOM"] = ReactDOM;
    global["PropTypes"] = PropTypes;
    global["ReactBootstrap"] = ReactBootstrap;
    import('../project/main.js').then(() => {
            const generator = new WidgetLibraryGenerator(projectDir, ReactBootstrap, HELPERS, DECLARATIONS);
            generator.generateLibrary("library/");
        }
    )
}
