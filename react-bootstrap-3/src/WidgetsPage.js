import React from 'react';
import { FormGroup, ControlLabel, HelpBlock, MenuItem } from 'react-bootstrap';
import DatePicker from './datepicker/DatePicker';
import LocalDate from './intrinsic/LocalDate';
import List from "./intrinsic/List";
import PromptoTypeahead from './typeahead/PromptoTypeahead';
import ContextMenu from "./contextmenu/ContextMenu";

window.LocalDate = LocalDate;
window.List = List;

export default class WidgetsPage extends React.Component {

    constructor(props) {
        super(props);
        const options = [{id: 1, name: "John"}, {id: 2, name: "Eric"}];
        this.state = { dateValue: new LocalDate("1961-12-26"), selectOptions: options, selected: null, contextMenu: false};
    }

    handleDateChange(dateValue, inputText) {
        if(!(dateValue instanceof LocalDate)) {
            console.log(dateValue);
        }
        this.setState({dateValue: dateValue});
    }

    handleSelectChange(selected) {
        this.setState({selected: selected[0]}, ()=>{
            const typeahead = this.refs.typeahead;
            typeahead && typeahead.clear();
        });
    }

    handleContextMenu(e) {
        e.preventDefault();
        this.setState({contextMenu: true});
    }

    render() {
        const menuStyle = { position: "fixed", display: "block", left: 100, top: 100, zIndex: 999999 };
        const selected = this.state.selected ? this.state.selected.name : "";
        return <>
                 <FormGroup >
                    <ControlLabel onContextMenu={this.handleContextMenu.bind(this)}>Label</ControlLabel>
                    <DatePicker id="example-datepicker" value={this.state.dateValue} onChange={this.handleDateChange.bind(this)} />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Employee</ControlLabel>
                    <PromptoTypeahead ref={"typeahead"} id="example-typeahead" options={this.state.selectOptions} labelKey="name" onChange={this.handleSelectChange.bind(this)}/>
                    <HelpBlock>{selected}</HelpBlock>
                </FormGroup>
                { this.state.contextMenu &&
                    <div style={menuStyle}>
                        <ContextMenu>
                            <MenuItem key={1}>Some stuff</MenuItem>
                            <MenuItem key={2}>Other stuff</MenuItem>
                        </ContextMenu>
                    </div>
                }
            </>
    }
}