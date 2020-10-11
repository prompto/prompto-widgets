import React from 'react';
import AceResourceEditor from "./AceResourceEditor";
import { Dropdown, DropdownButton } from 'react-bootstrap';

const SAMPLES = {
    "text/plain": "Hello",
    "text/html": "<html><header></header><body></body></html>",
    "text/css": "xyz { width: 100%; }",
    "text/json": '{ "name": "John", "age": 25 }',
    "text/yaml": "entry:\n  field: 25\n",
    "text/javascript": "function method() {}",
    "text/babel": "function method() { return <html/>; }",
    "text/xml": "<root><elem>value</elem></root>"
};

export default class ResourceEditorPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = { mimeType: "text/plain" };
     }

    render() {
        return <>
            { this.renderSelector() }
                <div style={{width: "600px", height: "600px"}}>
                    <AceResourceEditor ref="AceResourceEditor" /*commitAndReset={()=>alert("commitAndReset")} bodyEdited={t=>alert(t)}*/ />
                </div>
            </>;
    }

    renderSelector() {
        return <div style={{marginBottom: "15px"}}>
            <DropdownButton key={this.state.mimeType} title={this.state.mimeType} onSelect={this.mimeTypeSelected.bind(this)}>
            <Dropdown.Item eventKey={"text/plain"}>Text</Dropdown.Item>
            <Dropdown.Item eventKey={"text/html"}>Html</Dropdown.Item>
            <Dropdown.Item eventKey={"text/css"}>Css</Dropdown.Item>
            <Dropdown.Item eventKey={"text/json"}>Json</Dropdown.Item>
            <Dropdown.Item eventKey={"text/yaml"}>Yaml</Dropdown.Item>
            <Dropdown.Item eventKey={"text/javascript"}>Javascript</Dropdown.Item>
            <Dropdown.Item eventKey={"text/babel"}>Babel</Dropdown.Item>
            <Dropdown.Item eventKey={"text/xml"}>Xml</Dropdown.Item>
        </DropdownButton>
        </div>;
    }

    mimeTypeSelected(mimeType) {
        const editor = this.refs["AceResourceEditor"];
        editor.setResource({mimeType: mimeType, body: SAMPLES[mimeType]});
        this.setState({mimeType: mimeType});
    }

}