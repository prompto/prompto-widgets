/*eslint-disable no-alert, no-console */
import 'brace/mode/text';
import PromptoHighlightRules from "./PromptoHighlightRules";
import PromptoBehaviour from "./PromptoBehaviour";
import Defaults from "../code/Defaults";
import PromptoWorkerClient from "../worker/PromptoWorkerClient";
import BreakpointsList from "./BreakpointsList";
import LineBreakpoint from "./LineBreakpoint";

function resourceToWorkerMessage(resource) {
    if(resource !== null) {
        // noinspection JSUnresolvedVariable
        const type = resource.$categories[resource.$categories.length - 1].name;
        const prototype = resource.prototype === undefined ? null : resource.prototype;
        return {type: type, name: resource.name, prototype: prototype};
    } else
        return null;
}

function stackFrameToWorkerMessage(stackFrame) {
    if(stackFrame !== null) {
        const prototype = stackFrame.prototype === undefined ? null : stackFrame.prototype;
        return { categoryName: stackFrame.categoryName, methodName: stackFrame.methodName, methodProto: prototype };
    } else
        return null;
}


function breakpointToWorkerMessage(breakpoint) {
    if(breakpoint !== null) {
        return { categoryName: breakpoint.categoryName, methodName: breakpoint.methodName, methodProto: breakpoint.methodProto, statementLine: breakpoint.statementLine };
    } else
        return null;
}

// eslint-disable-next-line no-unused-vars
function silentProgress(text) {
}


// noinspection JSUnresolvedVariable,JSUnusedGlobalSymbols
export default class PromptoMode extends window.ace.acequire("ace/mode/text")
    .Mode {

    constructor(editor) {
        super();
        this.$id = "ace/mode/prompto";
        this.$editor = editor;
        this.$dialect = Defaults.dialect;
        this.HighlightRules = PromptoHighlightRules;
        this.$behaviour = new PromptoBehaviour();
        this.$progressed = silentProgress;
        this.breakpointsList = new BreakpointsList();
    }

    setProject(dbId, loadDependencies, progressed) {
        this.$progressed = progressed;
        this.$worker && this.$worker.send("setProject", [ dbId, loadDependencies ] );
    }

    setDialect(dialect) {
        this.$dialect = dialect;
        this.$worker && this.$worker.setDialect(dialect);
    }

    getResourceBody(resource, callback) {
        const content = resourceToWorkerMessage(resource);
        this.getContentBody(content, callback);
    }

    getContentBody(content, callback) {
        this.$worker && this.$worker.call("getContentBody", [ content ], value => callback(value));
    }

    setResource(resource, clearValue) {
        const content = resourceToWorkerMessage(resource);
        this.setContent(content, clearValue);
    }

    setContent(content, clearValue) {
        this.$worker && this.$worker.send("setContent", [ content, clearValue ] );
    }

    contentForStackFrame( stackFrame, callback) {
        const message = stackFrameToWorkerMessage(stackFrame);
        this.$worker && this.$worker.call("contentForStackFrame", [ message ], callback);
    }

    destroyResource(resource) {
        const content = resourceToWorkerMessage(resource);
        this.$worker && this.$worker.send("destroyContent", [ content ] );
    }

    getEditedResources(resources, callback) {
        const contents = resources.map(edited => resourceToWorkerMessage(edited), this);
        this.$worker && this.$worker.call("getEditedContents", [ contents ], callback);
    }

    markChangesCommitted() {
        this.$worker && this.$worker.send("markChangesCommitted", [ ] );
    }

    runMethod(methodRef, progressed, done) {
        this.$progressed = progressed;
        const content = resourceToWorkerMessage(methodRef);
        this.$worker && this.$worker.call("runMethod", [ content ], () => {
            this.$progressed = silentProgress;
            done();
        });
    }

    runTest(testRef, progressed, done) {
        this.$progressed = progressed;
        const message = resourceToWorkerMessage(testRef);
        this.$worker && this.$worker.call("runTest", [ message ], () => {
            this.$progressed = silentProgress;
            done();
        });
    }

    createWorker() {
        this.$worker = new PromptoWorkerClient(this.$editor, Defaults.dialect);
        return this.$worker;
    }

    // a utility method to inspect worker data in Firefox/Safari
    inspect = function(name) {
        this.$worker && this.$worker.send("inspect", [ name ] );
    };

    dependenciesUpdated() {
        this.$worker && this.$worker.send("dependenciesUpdated", [] );
    }

    onProgressed(message) {
        this.$progressed(message);
    }

    onCatalogLoaded(catalog, completed) {
        this.$editor.catalogLoaded(catalog, completed);
        if(completed)
            this.$progressed = silentProgress;
    }

    onCatalogUpdated(catalog) {
        this.$editor.catalogUpdated(catalog);
    }

    onBodyEdited(content) {
        this.$editor.bodyEdited(content);
    }

    createBreakpointAtLine(line, set, callback) {
        this.$worker && this.$worker.call("createBreakpointAtLine", [ line ], brkpt => {
            if(brkpt) {
                const lineBrkpt = new LineBreakpoint(brkpt.categoryName, brkpt.methodName, brkpt.methodProto, brkpt.methodLine, brkpt.statementLine, false);
                this.breakpointsList.register(lineBrkpt, set);
            }
            if(callback)
                callback(brkpt);
        });
    }

    getResourceBreakpoints(resource) {
        // no resource for "new prompto code..."
        if(!resource)
            return [];
        const content = resourceToWorkerMessage(resource);
        return this.breakpointsList.matchingContent(content);
    }

    locateSection(breakpoint, callback) {
        const message = breakpointToWorkerMessage(breakpoint);
        this.$worker && this.$worker.call("locateSection", [ message ], callback);
    }

    locateSections(breakpoints, callback) {
        const message = breakpoints.map(brkpt => breakpointToWorkerMessage(brkpt));
        this.$worker && this.$worker.call("locateSections", [ message ], callback);
    }
}