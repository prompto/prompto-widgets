import React from 'react';
import AceEditor from "react-ace";
/*eslint-disable no-alert, no-console */
import "ace-builds/src-noconflict/theme-eclipse";
import "ace-builds/src-noconflict/mode-text";
import PromptoMode from "./mode/PromptoMode";

export default class AcePromptoEditor extends React.Component {

    constructor(props) {
        super(props);
        this.projectId = null;
        this.state = {settingValue: false};
    }

    getEditor() {
        return this.refs.AceEditor.editor;
    }

    getSession() {
        return this.refs.AceEditor.editor.getSession();
    }

    componentDidMount() {
        const session = this.getSession();
        session.setMode(new PromptoMode(this));
        // session.setUseWorker(true);
        if(this.props.commitAndReset) {
            const editor = this.getEditor();
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
                       width="100%" height="100%" editorProps={{ $blockScrolling: Infinity }}  />
        </div>;
    }


    setProject(dbId, loadDependencies) {
        this.projectId = dbId;
        this.getSession().getMode().setProject(dbId, loadDependencies);
    }

    catalogUpdated(catalog) {
        if(this.props.catalogUpdated)
            this.props.catalogUpdated(catalog);
        else
            console.log("Missing property: catalogUpdated");
    }

    contentUpdated(delta) {
        if(this.props.contentUpdated)
            this.props.contentUpdated(delta);
        else
            console.log("Missing property: contentUpdated");
    }

    setResource(resource) {
        this.setState({settingValue: true}, ()=>this.doSetResource(resource));
    }

    doSetResource(resource) {
        const editor = this.getEditor();
        const session = editor.getSession();
        const mode = session.getMode();
        // session.clearGutterDecorations(); // debugger-line
        // session.clearBreakpoints();
        mode.setResource(resource);
        mode.getResourceBody(resource, body => {
           editor.setValue(body, -1);
           editor.setReadOnly(this.props.readOnly || false);
           session.setScrollTop(0);
           /* this.breakpoints.matchingContent(content).forEach(b => {
               session.setBreakpoint(b.line - 1);
           }); */
        });
           // this.setState({settingValue: false});
    }

}