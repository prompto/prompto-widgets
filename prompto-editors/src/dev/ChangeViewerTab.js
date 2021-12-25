import React from 'react';
import {Dropdown, DropdownButton} from "react-bootstrap";
import AceChangeViewer from "../AceChangeViewer";

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

export default class ChangeViewerTab extends React.Component {

    constructor(props) {
        super(props);
        this.state = { mimeType: "text/plain" };
        this.didResize = false;
        this.targetNode = null;
        this.observer = null;
    }

    componentDidMount() {
        const targetNode = document.getElementById('change-viewer-tab').parentElement;
        if(targetNode !== this.targetNode) {
            if(this.observer !== null) {
                this.observer.disconnect();
                this.observer = null;
            }
            this.targetNode = targetNode;
            this.observer = new MutationObserver(function() {
                if(targetNode.ariaHidden === "false")
                    this.forceResize();
            }.bind(this));
            this.observer.observe(targetNode, { attributes: true });
        }
    }

    componentWillUnmount() {
        if(this.observer !== null) {
            this.observer.disconnect();
            this.observer = null;
        }
    }


    render() {
        return <>
            { this.renderChangeToolbar() }
            { this.renderChangeViewer() }
            </>;
    }

    renderChangeToolbar() {
        return <div style={{margin: "15px"}} id="change-viewer-tab">
            <DropdownButton key={this.state.mimeType} title={this.state.mimeType} onSelect={this.changeSelected.bind(this)}>
                <Dropdown.Item eventKey={"text/plain"}>Text</Dropdown.Item>
                <Dropdown.Item eventKey={"text/json"}>Json</Dropdown.Item>
                <Dropdown.Item eventKey={"prompto/objy"}>Objy</Dropdown.Item>
            </DropdownButton>
        </div>;
    }

    changeSelected(mimeType) {
        this.setState({mimeType: mimeType});
    }

    renderChangeViewer() {
        const currentVersion = CHANGE_SAMPLES[this.state.mimeType].current;
        const proposedVersion = CHANGE_SAMPLES[this.state.mimeType].proposed;
        return <div style={{width: "600px", height: "400px"}}>
            <AceChangeViewer ref="AceChangeViewer" mimeType={this.state.mimeType} currentVersion={currentVersion} proposedVersion={proposedVersion} />
        </div>;
    }

    forceResize() {
        if(!this.didResize) {
            this.didResize = true;
            this.refs.AceChangeViewer.refs.ChangeViewer.SplitViewer.current.split.resize(true);
            this.refs.AceChangeViewer.forceUpdate();
        }
    }

}
