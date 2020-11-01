import React from 'react';
import AceEditor from "react-ace";
/*eslint-disable no-alert, no-console */
import "ace-builds/src-noconflict/theme-eclipse";
import "ace-builds/src-noconflict/mode-text";
import PromptoMode from "./mode/PromptoMode";

export default class AcePromptoEditor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {settingValue: false};
    }

    componentDidMount() {
        const editor = this.refs.AceEditor.editor;
        const session = editor.getSession();
        session.setMode(new PromptoMode(this));
        // session.setUseWorker(true);
        if(this.props.commitAndReset) {
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
        /* if(this.props.bodyEdited)
            this.props.bodyEdited(newBody); */
    }

}