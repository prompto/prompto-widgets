import React from "react";

function fetchWrappedType(forwardRef) {
    const globalReact = global["React"] || React;
    let wrappedType = null;
    const saved_createElement = globalReact.createElement;
    try {
        globalReact.createElement = function (type) {
            if( wrappedType == null)
                wrappedType = type;
        }
        forwardRef.render({ id: "x" }, () => {} );
    } finally {
        globalReact.createElement = saved_createElement;
    }
    return wrappedType;
}

function fetchPropTypesAndDefaultProps(klass) {
    const globalReact = global["React"] || React;
    if(klass.propTypes || globalReact.Component.prototype.isPrototypeOf(klass.prototype))
        return { propTypes: klass.propTypes, defaultProps: klass.defaultProps };
    if(klass.$$typeof === Symbol.for('react.forward_ref')) {
        const wrappedType = fetchWrappedType(klass);
        if(wrappedType)
            return fetchPropTypesAndDefaultProps(wrappedType);
    }
    return klass;
}

export { fetchPropTypesAndDefaultProps };