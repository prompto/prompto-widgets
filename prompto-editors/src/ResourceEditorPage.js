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

export default class ResourceEditorPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = { mimeType: "text/plain" };
     }

    render() {
        return <>
            { this.renderSelector() }
            { this.renderResourceEditor() }
            { this.renderDiffToolbar() }
            { this.renderChangeViewer() }
            </>;
    }

    renderDiffToolbar() {
        return <div style={{marginBottom: "15px"}}>
        </div>;
    }

    createCodeLines(ranges) {
        const arrays = ranges.map(r => [...Array(1 + r[1] - r[0]).keys()].map(i => i + r[0]));
        let ids = [];
        arrays.forEach(a => ids = ids.concat(a));
        return ids.map(i => "line " + i).join("\n");
    }

    renderChangeViewer() {
        const currentVersion = this.createCodeLines([[1, 3], [6, 9], [12, 40]])
        const proposedVersion = this.createCodeLines([[1, 7], [10, 15], [27, 50]]);

       return <div style={{width: "600px", height: "200px"}}>
            <AceChangeViewer ref="AceChangeViewer" currentVersion={currentVersion} proposedVersion={proposedVersion} />
        </div>;
    }

    renderResourceEditor() {
        return <div style={{width: "600px", height: "400px"}}>
            <AceResourceEditor ref="AceResourceEditor" /*commitAndReset={()=>alert("commitAndReset")} bodyEdited={t=>alert(t)}*/ />
        </div>;
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
