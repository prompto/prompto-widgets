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
import "ace-builds/src-noconflict/ext-searchbox";
import "./AceWebpackResolver.js"


const MIME_TYPE_MODE_ID = {
    "page" : "yaml",
    "plain" : "text",
    "babel" : "jsx"
};

export default class AceResourceEditor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {mimeType: "text/plain", settingValue: false};
    }

    componentDidMount() {
        this.installCommitShortcut();
    }

    getEditor() {
        return this.refs.AceEditor.editor;
    }

    installCommitShortcut() {
        if(this.props.onCommit) {
            const editor = this.getEditor();
            editor.commands.addCommand({
                name: "commit",
                bindKey: {win: "Ctrl-S", mac: "Command-S"},
                exec: ()=>{
                    this.props.onCommit();
                    return true;
                }
            });
        }
    }

    render() {
        const style = {position: "relative", width: "100%",  height: "100%" };
        return <div style={style} >
                <AceEditor ref="AceEditor" name="resource-editor"
                           theme="eclipse" mode="text"
                           onChange={this.bodyEdited.bind(this)}
                           width="100%" height="100%" editorProps={{ $blockScrolling: Infinity }}  />
                </div>;
    }

    bodyEdited(newBody) {
        if(this.state.settingValue)
            return;
        if(this.props.bodyEdited)
            this.props.bodyEdited(newBody);
    }

    setResource(resource, readOnly) {
        this.setState({settingValue: true}, ()=>this.doSetResource(resource, readOnly));
    }

    doSetResource(resource, readOnly) {
        const mimeType = this.readMimeType(resource);
        const editor = this.getEditor();
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
        editor.setReadOnly(readOnly);
        this.setState({mimeType: mimeType, settingValue: false});
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