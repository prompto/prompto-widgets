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
    }

    setProject(dbId, loadDependencies) {
        this.$worker && this.$worker.send("setProject", [ dbId, loadDependencies ] );
    }

    setDialect(dialect) {
        this.$dialect = dialect;
        this.$worker && this.$worker.setDialect(dialect);
    }

    resourceToContent(resource) {
        if(resource !== null) {
            const type = resource.$categories[resource.$categories.length - 1].name;
            return {type: type, name: resource.name, prototype: resource.prototype || null};
        } else
            return null;
    }

    getResourceBody(resource, callback) {
        const content = this.resourceToContent(resource);
        this.$worker && this.$worker.call("getContentBody", [ content ], value => callback(value));
    }

    setResource(resource, clearValue) {
        const content = this.resourceToContent(resource);
        this.$worker && this.$worker.send("setContent", [ content, clearValue ] );
    }

    locateContent( stackFrame, callback) {
        this.$worker && this.$worker.call("locateContent", [ stackFrame ], callback);
    }


    locateSection( breakpoint, callback) {
        this.$worker && this.$worker.call("locateSection", [ breakpoint ], callback);
    }

    destroyResource(resource) {
        const content = this.resourceToContent(resource);
        this.$worker && this.$worker.send("destroyContent", [ content ] );
    }

    prepareCommit(callback) {
        this.$worker && this.$worker.call("prepareCommit", [], callback);
    }

    commitFailed(dbId) {
        this.$worker && this.$worker.send("commitFailed", [ dbId ] );
    }

    commitSuccessfull(dbId) {
        this.$worker && this.$worker.send("commitSuccessfull", [ dbId ] );
    }

    runTestOrMethod(id, mode, callback) {
        this.$worker && this.$worker.call("runTestOrMethod", [ id, mode ], callback );
    }

    debugMethod(id, mode) {
        this.$worker && this.$worker.send("debugMethod", [ id, mode ] );
    }

    fetchRunnablePage(content, callback) {
        this.$worker && this.$worker.call("fetchRunnablePage", [ content ], callback );
    }

    createWorker(session) {
        this.$worker = new PromptoWorkerClient(this.$editor, Defaults.dialect);
        return this.$worker;
    }

    // a utility method to inspect worker data in Firefox/Safari
    inspect = function(name) {
        this.$worker && this.$worker.send("inspect", [ name ] );
    }

    dependenciesUpdated() {
        this.$worker && this.$worker.send("dependenciesUpdated", [] );
    }

    onCatalogLoaded(catalog) {
        this.$editor.catalogLoaded(catalog);
    }

    onContentUpdated(catalog) {
        this.$editor.contentUpdated(catalog);
    }

}