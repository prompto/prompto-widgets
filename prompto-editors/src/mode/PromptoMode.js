/*eslint-disable no-alert, no-console */
import 'brace/mode/text';
import PromptoHighlightRules from "./PromptoHighlightRules";
import PromptoBehaviour from "./PromptoBehaviour";
import Defaults from "../code/Defaults";
import PromptoWorkerClient from "../worker/PromptoWorkerClient";

export default class PromptoMode extends window.ace.acequire("ace/mode/text")
    .Mode {

    constructor(editor) {
        super();
        this.$id = "ace/mode/prompto";
        this.$editor = editor;
        this.$dialect = Defaults.dialect;
        this.HighlightRules = PromptoHighlightRules;
        this.$behaviour = new PromptoBehaviour();
        this.$progressed = text => {};
    }

    setProject(dbId, loadDependencies, progressed) {
        this.$progressed = progressed;
        this.$worker && this.$worker.send("setProject", [ dbId, loadDependencies ] );
    }

    setDialect(dialect) {
        this.$dialect = dialect;
        this.$worker && this.$worker.setDialect(dialect);
    }

    static resourceToContent(resource) {
        if(resource !== null) {
            const type = resource.$categories[resource.$categories.length - 1].name;
            return {type: type, name: resource.name, prototype: resource.prototype || null};
        } else
            return null;
    }

    getResourceBody(resource, callback) {
        const content = PromptoMode.resourceToContent(resource);
        this.$worker && this.$worker.call("getContentBody", [ content ], value => callback(value));
    }

    setResource(resource, clearValue) {
        const content = PromptoMode.resourceToContent(resource);
        this.$worker && this.$worker.send("setContent", [ content, clearValue ] );
    }

    locateContent( stackFrame, callback) {
        this.$worker && this.$worker.call("locateContent", [ stackFrame ], callback);
    }


    locateSection( breakpoint, callback) {
        this.$worker && this.$worker.call("locateSection", [ breakpoint ], callback);
    }

    destroyResource(resource) {
        const content = PromptoMode.resourceToContent(resource);
        this.$worker && this.$worker.send("destroyContent", [ content ] );
    }

    getEditedResources(resources, callback) {
        const contents = resources.map(edited => PromptoMode.resourceToContent(edited.stuff), this);
        this.$worker && this.$worker.call("getEditedContents", [ contents ], callback);
    }

    markChangesCommitted() {
        this.$worker && this.$worker.send("markChangesCommitted", [ ] );
    }

    runMethod(methodRef, progressed, done) {
        this.$progressed = progressed;
        const content = PromptoMode.resourceToContent(methodRef);
        this.$worker && this.$worker.call("runMethod", [ content ], () => {
            this.$progressed = text => {};
            done();
        });
    }

    runTest(testRef, progressed, done) {
        this.$progressed = progressed;
        const content = PromptoMode.resourceToContent(testRef);
        this.$worker && this.$worker.call("runTest", [ content ], () => {
            this.$progressed = text => {};
            done();
        });
    }

    createWorker(session) {
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
            this.$progressed = text => {};
    }

    onCatalogUpdated(catalog) {
        this.$editor.catalogUpdated(catalog);
    }

    onBodyEdited(content) {
        this.$editor.bodyEdited(content);
    }

}