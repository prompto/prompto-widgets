import React from 'react';
import { Form, FormGroup, FormControl, FormLabel, Dropdown, InputGroup } from 'react-bootstrap';
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
            typeahead && typeahead.getInstance().clear();
        });
    }

    handleContextMenu(e) {
        e.preventDefault();
        this.setState({contextMenu: true});
    }

    render() {
        const menuStyle = { position: "fixed", display: "block", left: 100, top: 100, zIndex: 999999 };
        const selected = this.state.selected ? this.state.selected.name : "";
        return <div style={{width: "500px"}}>
            <InputGroup className="mb-3" >
                <FormControl
                    placeholder="Recipient's username"
                    aria-label="Recipient's username"
                    aria-describedby="basic-addon2"
                />
                <InputGroup.Append>
                    <InputGroup.Text id="basic-addon2">@example.com</InputGroup.Text>
                </InputGroup.Append>
            </InputGroup>

            <FormGroup >
                    <FormLabel onContextMenu={this.handleContextMenu.bind(this)}>Date picker</FormLabel>
                    <DatePicker id="example-datepicker" value={this.state.dateValue} onChange={this.handleDateChange.bind(this)} />
                </FormGroup>
                <FormGroup>
                    <FormLabel>Employee</FormLabel>
                    <PromptoTypeahead ref={"typeahead"} id="example-typeahead" options={this.state.selectOptions} labelKey="name" onChange={this.handleSelectChange.bind(this)}/>
                    <Form.Control.Feedback>{selected}</Form.Control.Feedback>
                </FormGroup>
            { this.state.contextMenu &&
                <div style={menuStyle}>
                    <ContextMenu>
                        <Dropdown.Item key={1}>Some stuff</Dropdown.Item>
                        <Dropdown.Item key={2}>Other stuff</Dropdown.Item>
                    </ContextMenu>
                </div>
            }
            </div>
    }
}