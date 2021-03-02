import React from 'react';
import { Typeahead } from "react-bootstrap-typeahead";

export default React.forwardRef((props, ref)=>{
    const adjustedProps = { ...props };
    if(typeof(props.labelKey)==="string") {
        adjustedProps.labelKey = o => o[props.labelKey];
    }
    if(!props.options) {
        adjustedProps.options = [];
    } else if(!Array.isArray(props.options) && props.options.toList) {
        adjustedProps.options = props.options.toList();
    }
    if(props.onChange) {
        adjustedProps.onChange = items => props.onChange(new window.List(false, items));
    }
    return <Typeahead ref={ref} {...adjustedProps}/>;

});