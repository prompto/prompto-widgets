import React from 'react';
import AceEditor from "react-ace";
/*eslint-disable no-alert, no-console */
import "ace-builds/src-noconflict/theme-eclipse";
import "ace-builds/src-noconflict/mode-text";
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-jsx';
import "./AceWebpackResolver.js"


const MIME_TYPE_MODE_ID = {
    "page" : "yaml",
    "plain" : "text",
    "babel" : "jsx"
};

export default class AceResourceEditor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {dmimeType: "text/plain", body: ""};
    }

    componentDidMount() {
        if(this.props.commitAndReset) {
            const editor = this.refs.AceEditor.editor;
            editor.commands.addCommand({
                name: "commit",
                bindKey: {win: "Ctrl-S", mac: "Command-S"},
                exec: ()=>{
                    this.props.commitAndReset();
                    return true;
                }
            });
        }
    }

    render() {
        const style = {display: this.state.display, position: "relative", width: "100%",  height: "100%" };
        return <div style={style} >
                <AceEditor ref="AceEditor" name="resource-editor"
                           theme="eclipse" mode="text"
                           value={this.state.body} onChange={this.bodyEdited.bind(this)}
                           width="100%" height="100%" editorProps={{ $blockScrolling: Infinity }}  />
                </div>;
    }

    bodyEdited(newBody) {
        this.setState({body: newBody});
        this.props.bodyEdited && this.props.bodyEdited(newBody);
    }

    setResource(resource) {
        const mimeType = this.readMimeType(resource);
        const editor = this.refs.AceEditor.editor;
        const session = editor.getSession();
        const oldModeId = this.readModeId(this.state.mimeType);
        const newModeId = this.readModeId(mimeType);
        if (newModeId && newModeId !== oldModeId) {
            session.setMode("ace/mode/" + newModeId);
            session.setUseWorker(true);
        }
        if (newModeId != null) {
            editor.setValue(resource.body, -1);
            session.setScrollTop(0);
        }
        editor.setReadOnly(this.props.readOnly || false);
        this.setState({mimeType: mimeType, body: resource.body});
    }

    readMimeType(resource) {
        return resource && resource.mimeType ? resource.mimeType : "binary/blob";
    }

    readModeId(mimeType) {
        if (mimeType && mimeType.startsWith("text/")) {
            const textType = mimeType.split("/")[1];
            return MIME_TYPE_MODE_ID[textType] || textType;
        } else
            return null;
    }
}