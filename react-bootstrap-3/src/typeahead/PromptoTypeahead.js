import React from 'react';
import { Typeahead } from "react-bootstrap-typeahead";
import List from "../intrinsic/List";

export default class PromptoTypeahead extends React.Component {

    render() {
        const adjustedProps = { ...this.props };
        if(typeof(this.props.labelKey)==="string") {
            adjustedProps.labelKey = o => o[this.props.labelKey];
        }
        if(!this.props.options) {
            adjustedProps.options = [];
        } else if(!Array.isArray(this.props.options) && this.props.options.toList) {
            adjustedProps.options = this.props.options.toList();
        }
        if(this.props.onChange) {
            adjustedProps.onChange = items => this.props.onChange(new List(false, items));
        }
        return React.createElement(Typeahead, adjustedProps, this.props.children);
    }
}