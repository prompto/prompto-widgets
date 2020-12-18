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
        this.state = {newContent: null};
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
            <AceEditor ref="AceEditor" name="prompto-editor"
                       theme="eclipse" mode="text"
                       width="100%" height="100%" editorProps={{ $blockScrolling: Infinity }}  />
        </div>;
    }


    setProject(dbId, loadDependencies) {
        this.projectId = dbId;
        this.getSession().getMode().setProject(dbId, loadDependencies);
    }

    catalogLoaded(catalog) {
        if(this.props.catalogLoaded)
            this.props.catalogLoaded(catalog);
        else
            console.log("Missing property: catalogLoaded");
    }

    catalogUpdated(delta) {
        if(this.props.catalogUpdated) {
            this.setState({newContent: delta.newContent || null});
            this.props.catalogUpdated(delta);
        } else
            console.log("Missing property: catalogUpdated");
    }

    bodyEdited(content) {
        if(this.props.bodyEdited)
            this.props.bodyEdited(content);
        else
            console.log("Missing property: bodyEdited");
    }

    setResource(resource, readOnly) {
        const editor = this.getEditor();
        const session = editor.getSession();
        const mode = session.getMode();
        // session.clearGutterDecorations(); // debugger-line
        // session.clearBreakpoints();
        if(this.state.newContent) {
            mode.setResource(resource, false);
            this.setState({newContent: null});
        } else {
            mode.setResource(resource, true);
            mode.getResourceBody(resource, body => {
                editor.setValue(body, -1);
                editor.setReadOnly(readOnly);
                session.setScrollTop(0);
                /* this.breakpoints.matchingContent(content).forEach(b => {
                    session.setBreakpoint(b.line - 1);
                }); */
            });
        }
    }

    destroyResource(resource) {
        const editor = this.getEditor();
        const session = editor.getSession();
        const mode = session.getMode();
        mode.destroyResource(resource);
    }

}