import React from 'react';
import AceEditor from "react-ace";
/*eslint-disable no-alert, no-console */
import "ace-builds/src-noconflict/theme-eclipse";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/ext-searchbox";
import PromptoMode from "./mode/PromptoMode";
import BreakpointFactory from "./mode/BreakpointFactory";
import BreakpointsList from "./mode/BreakpointsList";

function enhanceEditSession() {
    window.ace.EditSession.prototype.clearGutterDecorations = function () {
        // noinspection JSUnusedGlobalSymbols
        this.$decorations = [];
        this._signal("changeBreakpoint", {});
    };
}

function enhanceEditor() {
    window.ace.Editor.prototype.isReadOnly = function () {
        return this.$readOnly;
    };
}


// noinspection JSUnusedGlobalSymbols,JSUnresolvedFunction,JSUnresolvedVariable,JSDeprecatedSymbols
export default class AcePromptoEditor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {newContent: null, debugStatus: null};
        this.resourceBreakpoints = new BreakpointsList();
        this.settingValue = false;
        enhanceEditSession();
        enhanceEditor();
    }

    componentDidMount() {
        const session = this.getSession();
        session.setMode(new PromptoMode(this, Defaults.dialect, true));
        session.getDocument().on("change", this.adjustBreakpoints.bind(this));
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

    setBreakpoints(breakpoints) {
        breakpoints.forEach(brkpt => {
            const breakpoint = BreakpointFactory.fromInstance(brkpt);
            this.getMode().registerBreakpoint(breakpoint);
        });
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
        this.settingValue = true;
        editor.setValue(body, -1);
        this.settingValue = false;
        editor.setReadOnly(readOnly);
        session.setScrollTop(0);
    }

    setResource(resource, readOnly, callback) {
        const editor = this.getEditor();
        const session = editor.getSession();
        const mode = session.getMode();
        session.clearGutterDecorations(); // debugger-line
        session.clearBreakpoints();
        if(this.state.newContent) {
            mode.setResource(resource, false);
            this.setState({newContent: null}, callback);
        } else {
            mode.setResource(resource, true);
            mode.getResourceBody(resource, body => {
                this.settingValue = true;
                editor.setValue(body, -1);
                this.settingValue = false;
                editor.setReadOnly(readOnly);
                session.setScrollTop(0);
                this.resourceBreakpoints.use(mode.getResourceBreakpoints(resource));
                this.resourceBreakpoints.all().forEach(brkpt => {
                    session.setBreakpoint(brkpt.statementLine - 1);
                });
                if(callback)
                    callback();
            });
        }
    }

    /* called when stepping into code */
    setContent(content, readOnly, callback) {
        const editor = this.getEditor();
        const session = editor.getSession();
        const mode = session.getMode();
        session.clearGutterDecorations(); // debugger-line
        session.clearBreakpoints();
        mode.setContent(content, true);
        mode.getContentBody(content, body => {
            this.settingValue = true;
            editor.setValue(body, -1);
            this.settingValue = false;
            editor.setReadOnly(readOnly);
            session.setScrollTop(0);
            const breakpoints = mode.getContentBreakpoints(content);
            this.resourceBreakpoints.use(breakpoints);
            this.resourceBreakpoints.all().forEach(brkpt => {
                session.setBreakpoint(brkpt.statementLine - 1);
            });
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
            instances.forEach(this.convertEditedToMutated, this);
            callback(instances);
        });
    }

    convertEditedToMutated(edited) {
        if(edited.resource) {
            const resource = edited.resource;
            resource.$mutable = true;
            const category = resource.$storable.category;
            const dbIdFactory = { provider: resource.getDbId.bind(resource), listener: resource.setDbId.bind(resource) };
            resource.$storable = window.$DataStore.instance.newStorableDocument(category, dbIdFactory);
            resource.getAttributeNames().forEach(name => {
                const isEnum = resource[name] && resource[name].name && resource[name].name === resource[name].value;
                resource.setMember(name, resource[name], true, true, isEnum);
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
                    this.removeBreakpointAtRow(row, false);
                else
                    this.addBreakpointAtRowIfValid(row, false);
                click.stop();
            }
        }
    }

    removeBreakpointAtRow(row, isEdit) {
        this.getSession().clearBreakpoint(row);
        // add 1 since ace row is 0 based but prompto line is 1 based
        const brkpt = this.resourceBreakpoints.matchingLine(row + 1)[0];
        if (brkpt)
            this.removeBreakpoint(brkpt, isEdit);
    }

    removeBreakpoint(breakpoint, isEdit) {
        this.resourceBreakpoints.register(breakpoint, false);
        this.getMode().registerBreakpoint(breakpoint, false);
        if (this.props.breakpointRemoved) {
            const value = window.readJSONValue([ {type: breakpoint.getType(), value: breakpoint }, isEdit]);
            this.props.breakpointRemoved(value);
        }
    }

    addBreakpointAtRowIfValid(row, isEdit) {
        // add 1 since ace row is 0 based but prompto line is 1 based
        this.getMode().createBreakpointAtLine(row + 1, true, brkpt => {
            if (brkpt) {
                this.getSession().setBreakpoint(row);
                this.addBreakpoint(brkpt, isEdit);
            }
        });
    }

    addBreakpoint(breakpoint, isEdit) {
        this.resourceBreakpoints.register(breakpoint, true);
        this.getMode().registerBreakpoint(breakpoint, true);
        if(this.props.breakpointAdded) {
            const value = window.readJSONValue([{type: breakpoint.getType(), value: breakpoint }, isEdit]);
            this.props.breakpointAdded(value);
        }
    }

    locateSection(breakpoint, callback) {
        this.getMode().locateSection(breakpoint, found => {
            const section = window.readJSONValue(found);
            callback(section);
        });
    }

    locateSections(breakpoints, callback) {
        this.getMode().locateSections(breakpoints, found => {
            const sections = window.readJSONValue(found);
            callback(sections);
        });
    }

    adjustBreakpoints(delta) {
        // don't touche breakpoints while imperatively setting value
        if(this.settingValue)
            return;
        // changes with row do not affect breakpoints
        if (delta.end.row === delta.start.row)
            return;
        // if no edit allowed, no change can affect existing breakpoints
        if(this.getEditor().isReadOnly())
            return;
        const breakpoints = this.getSession().getBreakpoints();
        switch(delta.action) {
            case "insert":
                this.adjustBreakpointsOnInsert(delta, breakpoints.slice());
                break
            case "remove":
                this.adjustBreakpointsOnRemove(delta, breakpoints.slice());
                break
            default:
                console.log(delta.action + " not handled!");
        }
    }

    adjustBreakpointsOnInsert(delta, breakpoints) {
        const inserted = delta.end.row - delta.start.row;
        // special case for CR inserted at end of row with breakpoint
        const isEOL = this.isCrAtEOL(delta);
        for(let row of breakpoints.keys()) {
            if(!row || !breakpoints[row])
                continue;
            if(row < delta.start.row)
                continue;
            const breakpoint = this.resourceBreakpoints.matchingLine(row + 1)[0];
            if(breakpoint) {
                if(row > delta.start.row || !isEOL) {
                    this.getSession().clearBreakpoint(row);
                    this.removeBreakpoint(breakpoint, true)
                    this.getSession().setBreakpoint(row + inserted);
                    if (breakpoint.methodLine >= delta.start.row)
                        breakpoint.methodLine += inserted;
                    breakpoint.statementLine += inserted;
                    this.addBreakpoint(breakpoint, true);
                }
            } else
                console.log("Breakpoint not found for row: " + row);
        }
    }

    adjustBreakpointsOnRemove(delta, breakpoints) {
        const removed = delta.end.row - delta.start.row;
        // special case for CR remove at start of row following breakpoint
        const isSOL = this.isCrAtEOL(delta);
        for(let row of breakpoints.keys()) {
            if(!row || !breakpoints[row])
                continue;
            if(row < delta.start.row)
                continue;
            const breakpoint = this.resourceBreakpoints.matchingLine(row + 1)[0];
            if(breakpoint) {
                if(row > delta.start.row || !isSOL) {
                    this.getSession().clearBreakpoint(row);
                    this.removeBreakpoint(breakpoint, true)
                    if (row >= delta.end.row) {
                        this.getSession().setBreakpoint(row - removed);
                        if (breakpoint.methodLine >= delta.start.row)
                            breakpoint.methodLine -= removed;
                        breakpoint.statementLine -= removed;
                        this.addBreakpoint(breakpoint, true);
                    }
                }
            } else
                console.log("Breakpoint not found for row: " + row);
        }
    }

    isCrAtEOL(delta) {
        return delta.lines.length === 2 && delta.lines[0] === "" && delta.lines[1] === "" // no char inserted
            && delta.start.column > 0 && delta.start.column === this.getSession().getDocument().getLine(delta.start.row).length // first row change was at EOL
            && delta.end.column === 0; // second row change is at SOL
    }

}
