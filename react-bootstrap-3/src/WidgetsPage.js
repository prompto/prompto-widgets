import React from 'react';
import { FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';
import DatePicker from './DatePicker';
import LocalDate from './LocalDate';

export default class WidgetsPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = { dateValue: new LocalDate("1961-12-26")};
    }

    handleChange(dateValue, inputText) {
        if(!(dateValue instanceof LocalDate)) {
            console.log(dateValue);
        }
        this.setState({dateValue: dateValue});
    }


    render() {
        return <FormGroup>
            <ControlLabel>Label</ControlLabel>
            <DatePicker id="example-datepicker" value={this.state.dateValue} onChange={this.handleChange.bind(this)} />
            <HelpBlock>Help</HelpBlock>
        </FormGroup>;
    }
}