import React from 'react';
import AceEditor from "react-ace";
/*eslint-disable no-alert, no-console */
import "ace-builds/src-noconflict/theme-eclipse";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/ext-searchbox";
import PromptoMode from "./mode/PromptoMode";

function enhanceEditSession() {
    window.ace.EditSession.prototype.clearGutterDecorations = function () {
        // noinspection JSUnusedGlobalSymbols
        this.$decorations = [];
        this._signal("changeBreakpoint", {});
    };
}


// noinspection JSUnusedGlobalSymbols,JSUnresolvedFunction,JSUnresolvedVariable,JSDeprecatedSymbols
export default class AcePromptoEditor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {newContent: null, debugStatus: null};
        enhanceEditSession();
    }

    componentDidMount() {
        const session = this.getSession();
        session.setMode(new PromptoMode(this));
        this.installCommitShortcut();
        this.installToggleBreakpointAction();
    }

    getEditor() {
        return this.refs.AceEditor.editor;
    }

    getSession() {
        return this.getEditor().getSession();
    }

    getMode() {
        return this.getSession().getMode();
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

    installToggleBreakpointAction() {
        const editor = this.getEditor();
        editor.on("guttermousedown", this.toggleBreakpoint.bind(this));
    }

    render() {
        const style = {position: "relative", width: "100%",  height: "100%" };
        return <div style={style} >
            <AceEditor ref="AceEditor" name="prompto-editor"
                       theme="eclipse" mode="text"
                       width="100%" height="100%" editorProps={{ $blockScrolling: Infinity }}  />
        </div>;
    }


    setProject(dbId, loadDependencies, progressed) {
        this.projectId = dbId;
        this.getSession().getMode().setProject(dbId, loadDependencies, progressed);
    }

    setDialect(dialect) {
        this.getSession().getMode().setDialect(dialect);
    }

    catalogLoaded(catalog, completed) {
        if(this.props.catalogLoaded)
            this.props.catalogLoaded(catalog, completed);
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

    setBody(body, readOnly) {
        const editor = this.getEditor();
        const session = editor.getSession();
        editor.setValue(body, -1);
        editor.setReadOnly(readOnly);
        session.setScrollTop(0);
    }

    setResource(resource, readOnly, callback) {
        const editor = this.getEditor();
        const session = editor.getSession();
        const mode = session.getMode();
        session.clearGutterDecorations(); // debugger-line
        // session.clearBreakpoints();
        if(this.state.newContent) {
            mode.setResource(resource, false);
            this.setState({newContent: null}, callback);
        } else {
            mode.setResource(resource, true);
            mode.getResourceBody(resource, body => {
                editor.setValue(body, -1);
                editor.setReadOnly(readOnly);
                session.setScrollTop(0);
                /* this.breakpoints.matchingContent(content).forEach(b => {
                    session.setBreakpoint(b.line - 1);
                }); */
                if(callback)
                    callback();
            });
        }
    }

    setContent(content, readOnly, callback) {
        const editor = this.getEditor();
        const session = editor.getSession();
        const mode = session.getMode();
        mode.setContent(content, true);
        mode.getContentBody(content, body => {
            editor.setValue(body, -1);
            editor.setReadOnly(readOnly);
            session.setScrollTop(0);
            /* this.breakpoints.matchingContent(content).forEach(b => {
                session.setBreakpoint(b.line - 1);
            }); */
            if(callback)
                callback();
        });
    }

    destroyResource(resource) {
        const mode = this.getMode();
        mode.destroyResource(resource);
    }


    getEditedResources(resources, callback) {
        const mode = this.getMode();
        mode.getEditedResources(resources, edited => {
            const instances = window.readJSONValue(edited);
            instances.forEach(this.convertStuffToMutated, this);
            callback(instances);
        });
    }

    convertStuffToMutated(edited) {
        if(edited.stuff) {
            const stuff = edited.stuff;
            stuff.$mutable = true;
            const category = stuff.$storable.category;
            stuff.$storable = window.$DataStore.instance.newStorableDocument(category, stuff.dbIdListener.bind(stuff));
            stuff.getAttributeNames().forEach(name => {
                const isEnum = stuff[name] && stuff[name].name && stuff[name].name === stuff[name].value;
                stuff.setMember(name, stuff[name], true, true, isEnum);
            });
        }
        return edited;
    }

    markChangesCommitted() {
        const mode = this.getMode();
        mode.markChangesCommitted();
    }

    runMethod(methodRef, progressed, done) {
        const mode = this.getMode();
        mode.runMethod(methodRef, progressed, done);
    }

    runTest(testRef, progressed, done) {
        const mode = this.getMode();
        mode.runTest(testRef, progressed, done);
    }

    debuggerCreated(callback) {
        this.setState({debugStatus: "PROCESSING"}, callback);
    }

    showStackFrame(stackFrame, callback) {
        if (stackFrame)
            this.doShowStackFrame(stackFrame, callback);
        else
            this.setState({debugStatus: "PROCESSING"}, callback);
    }

    doShowStackFrame(stackFrame, callback) {
        this.getMode().contentForStackFrame(stackFrame, content => {
            this.setContent(content, true, () => {
                let line = stackFrame.statementLine;
                if(!stackFrame.categoryName || !stackFrame.categoryName.length)
                    line += 1 - stackFrame.methodLine;
                this.getEditor().gotoLine(line, 0, true);
                this.getSession().clearGutterDecorations();
                this.getSession().addGutterDecoration(line - 1, "debugger-line");
                this.setState({debugStatus: "IDLING"}, callback);
            })
        })
    }

    debuggerDisconnected(callback) {
        this.getSession().clearGutterDecorations();
        this.setState({debugStatus: null}, callback);
    }

    toggleBreakpoint(click) {
        const target = click.domEvent.target;
        if (target.className.indexOf("ace_gutter-cell") >= 0) {
            if (click.clientX <= 25 + target.getBoundingClientRect().left) {
                const session = this.getSession();
                const row = click.getDocumentPosition().row;
                const breakpoints = session.getBreakpoints();
                const hasBreakPoint = !!breakpoints[row];
                if(hasBreakPoint)
                    this.removeBreakpoint(row);
                else
                    this.addBreakpointIfValid(row);
                click.stop();
            }
        }
    }

    removeBreakpoint(row) {
        this.getSession().clearBreakpoint(row);
    }

    addBreakpointIfValid(row) {
        // add 1 since row is 0 based but line is 1 based
        this.getMode().createBreakpointAtLine(row + 1, brkpt => {
            if(brkpt) {
                row = brkpt.statementLine - 1;
                this.getSession().setBreakpoint(row)
            }
        });
    }

}