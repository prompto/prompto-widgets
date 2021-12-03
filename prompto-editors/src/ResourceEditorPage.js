import React from 'react';
import AceResourceEditor from "./AceResourceEditor";
import { Dropdown, DropdownButton } from 'react-bootstrap';
import AceChangeViewer from "./AceChangeViewer";

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

function createTextLines(ranges) {
    const arrays = ranges.map(r => [...Array(1 + r[1] - r[0]).keys()].map(i => i + r[0]));
    let ids = [];
    arrays.forEach(a => ids = ids.concat(a));
    return ids.map(i => "line " + i).join("\n");
}

const CHANGE_SAMPLES = {
    "text/plain": {
        current: createTextLines([[1, 3], [6, 9], [12, 40]]),
        proposed: createTextLines([[1, 7], [10, 15], [27, 50]])
    },
    "text/json": {
        current: '{\n"name": "John",\n"age": 25\n}\n',
        proposed: '{\n"name": "John",\n"age": 26\n}\n'
    },
    "prompto/objy": {
        current: 'category Thing(name);\ncategory Thing2(name);',
        proposed: 'category Thing(name);\ncategory Thing2(name2);'
    }
}

export default class ResourceEditorPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = { mimeType: "text/plain", changeType: "text/plain"};
     }

    render() {
        return <>
            { this.renderResourceSelector() }
            { this.renderResourceEditor() }
            { this.renderChangeToolbar() }
            { this.renderChangeViewer() }
            </>;
    }

    renderResourceEditor() {
        return <div style={{width: "600px", height: "400px"}}>
            <AceResourceEditor ref="AceResourceEditor" /*commitAndReset={()=>alert("commitAndReset")} bodyEdited={t=>alert(t)}*/ />
        </div>;
    }

    renderResourceSelector() {
        return <div style={{margin: "15px"}}>
            <DropdownButton key={this.state.mimeType} title={this.state.mimeType} onSelect={this.resourceSelected.bind(this)}>
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

    resourceSelected(mimeType) {
        const editor = this.refs["AceResourceEditor"];
        editor.setResource({mimeType: mimeType, body: SAMPLES[mimeType]});
        this.setState({mimeType: mimeType});
    }

    renderChangeToolbar() {
        return <div style={{margin: "15px"}}>
            <DropdownButton key={this.state.changeType} title={this.state.changeType} onSelect={this.changeSelected.bind(this)}>
                <Dropdown.Item eventKey={"text/plain"}>Text</Dropdown.Item>
                <Dropdown.Item eventKey={"text/json"}>Json</Dropdown.Item>
                <Dropdown.Item eventKey={"prompto/objy"}>Objy</Dropdown.Item>
            </DropdownButton>
        </div>;
    }

    changeSelected(mimeType) {
        this.setState({changeType: mimeType});
    }

    renderChangeViewer() {
        const currentVersion = CHANGE_SAMPLES[this.state.changeType].current;
        const proposedVersion = CHANGE_SAMPLES[this.state.changeType].proposed;
        return <div style={{width: "600px", height: "200px"}}>
            <AceChangeViewer ref="AceChangeViewer" mimeType={this.state.changeType} currentVersion={currentVersion} proposedVersion={proposedVersion} />
        </div>;
    }


}
