import React from 'react';
import { FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';
import DatePicker from './datepicker/DatePicker';
import LocalDate from './intrinsic/LocalDate';
import PromptoTypeahead from './typeahead/PromptoTypeahead';

export default class WidgetsPage extends React.Component {

    constructor(props) {
        super(props);
        const options = [{id: 1, name: "John"}, {id: 2, name: "Eric"}];
        this.state = { dateValue: new LocalDate("1961-12-26"), selectOptions: options, selected: null};
    }

    handleDateChange(dateValue, inputText) {
        if(!(dateValue instanceof LocalDate)) {
            console.log(dateValue);
        }
        this.setState({dateValue: dateValue});
    }

    handleSelectChange(selected) {
        this.setState({selected: selected[0]});
    }

    render() {
        return <>
                <FormGroup>
                    <ControlLabel>Label</ControlLabel>
                    <DatePicker id="example-datepicker" value={this.state.dateValue} onChange={this.handleDateChange.bind(this)} />
                    <HelpBlock>Help</HelpBlock>
                    <FormGroup>
                        <ControlLabel>Employee</ControlLabel>
                        <PromptoTypeahead id="example-typeahead" options={this.state.selectOptions} labelKey="name" onChange={this.handleSelectChange.bind(this)}/>
                        <HelpBlock>Help</HelpBlock>
                    </FormGroup>
                </FormGroup>
            </>
    }
}