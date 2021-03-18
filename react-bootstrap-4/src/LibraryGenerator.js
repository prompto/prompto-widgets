// to run this script you must go through the following steps
// from the widget-library-generator project, run 'npm link'
// this will publish the widget-library-generator package on your box
// from the react-bootstrap project, use the 'do-not-strip-prototypes' branch, then run 'npm link' (also uses a different package name)
// this will publish the patched react-bootstrap package on your box
// then from this project, run 'npm link widget-library-generator react-bootstrap'

import { PropTypes, TypeProperty, TypeSetProperty, ValueSetProperty, WidgetLibraryGenerator } from 'widget-library-generator';
import React from 'react';
import ReactDOM from "react-dom";
import { default as ReactBootstrap } from 'react-bootstrap-4';

const Any = propType => new TypeProperty("Any");
const Boolean = propType => new TypeProperty("Boolean");
const Text = propType => new TypeProperty("Text");
const Document = propType => new TypeProperty("Document");
const AnyCallback = propType => new TypeProperty("AnyCallback");
const BooleanCallback = propType => new TypeProperty("BooleanCallback");
const IntegerCallback = propType => new TypeProperty("IntegerCallback");
const DateChangedCallback = propType => new TypeProperty("DateChangedCallback");
const CarouselEventCallback = propType => new TypeProperty("CarouselEventCallback");

/* workaround issue where BS4 components created via createWithBsPrefix do not have propTypes */
const BS_PREFIX_HELPER = {
    "%MISSING%": {
        as: Text,
        bsPrefix: Text
    }
};

const HELPERS = {
    "Alert.Heading" : BS_PREFIX_HELPER,
    "Alert.Link" : BS_PREFIX_HELPER,
    "Card.Body" : BS_PREFIX_HELPER,
    "Card.Title" : BS_PREFIX_HELPER,
    "Card.Subtitle" : BS_PREFIX_HELPER,
    "Card.Link" : BS_PREFIX_HELPER,
    "Card.Text" : BS_PREFIX_HELPER,
    "Card.Header" : BS_PREFIX_HELPER,
    "Card.Footer" : BS_PREFIX_HELPER,
    "Card.ImgOverlay" : BS_PREFIX_HELPER,
    CardColumns : BS_PREFIX_HELPER,
    CardDeck : BS_PREFIX_HELPER,
    CardGroup : BS_PREFIX_HELPER,
    Carousel : {
        onSelect : IntegerCallback,
        onSlid : CarouselEventCallback,
        onSlide : CarouselEventCallback
    },
    "Carousel.Caption" : BS_PREFIX_HELPER,
    Dropdown : {
        onSelect : AnyCallback,
        onToggle : BooleanCallback
    },
    "Dropdown.Header" : BS_PREFIX_HELPER,
    "Dropdown.Divider" : BS_PREFIX_HELPER,
    "Dropdown.Item" : {
        onSelect: AnyCallback,
    },
    Figure : BS_PREFIX_HELPER,
    "Figure.Caption" : BS_PREFIX_HELPER,
    "Form.Control" : {
        custom: Boolean,
    },
    "Form.Check" : {
        custom: Boolean,
        type: propType => new ValueSetProperty(['radio', 'checkbox', 'switch'])
    },
    "Form.File" : {
        "data-browse": Text,
        lang: Text
    },
    "Form.Row" : BS_PREFIX_HELPER,
    "InputGroup.Append" : BS_PREFIX_HELPER,
    "InputGroup.Prepend" : BS_PREFIX_HELPER,
    "InputGroup.Text" : BS_PREFIX_HELPER,
    "Media.Body" : BS_PREFIX_HELPER,
    "Modal.Body" : BS_PREFIX_HELPER,
    "Modal.Footer" : BS_PREFIX_HELPER,
    "Modal.Title" : BS_PREFIX_HELPER,
    Nav : {
        justify: Boolean,
        onSelect: AnyCallback
    },
    "Navbar.Text" : BS_PREFIX_HELPER,
    "Toast.Body" : BS_PREFIX_HELPER,
    OverlayTrigger : {
        trigger: Any // TODO support inline enum array, was: <<"click", "hover", "focus">, <"click", "hover", "focus">[], null>
    },
    ProgressBar : {
        children: propType => new TypeProperty("ProgressBar[]")
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
    }
};

const DECLARATIONS = [
    "abstract method CarouselEventCallback(Integer eventKey, Text direction);",
    `native method clearTypeahead (Any typeahead) {
    JavaScript: typeahead.clear();
}
`,
    `abstract Text method TypeaheadLabelCallback(Any value);
`,
    `abstract method TypeaheadSelectionChangedCallback(Any[] values);
`
];

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
    global["ReactBootstrap"] = ReactBootstrap;
    import('../project/main.js').then(() => {
            const generator = new WidgetLibraryGenerator(projectDir, ReactBootstrap, HELPERS, DECLARATIONS, classResolver);
            generator.generateLibrary("library/");
        }
    )
}
