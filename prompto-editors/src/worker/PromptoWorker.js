import Mirror from '../ace/Mirror';
import Repository from '../code/Repository';
import Defaults from '../code/Defaults';
import Fetcher from '../utils/Fetcher';
import LocalInterpreter from "../runner/LocalInterpreter";
import {convertObjectToDocument} from "../code/CodeUtils";

// eslint-disable-next-line
const globals = self || window;

export default class PromptoWorker extends Mirror {

    constructor(sender) {
        super(sender);
        this.$projectId = null;
        this.$project = null;
        this.$dialect = Defaults.dialect;
        this.$value = ""; // the last value received
        this.$repo = new Repository();
        this.$loading = {};
        this.$selected = null;
        this.onInit();
    }

    // noinspection JSUnusedGlobalSymbols
    onInit() {
        this.markLoading("Project");
        // fake 'library' to ensure libraries are published only once dependencies are loaded
        this.markLoading("%Description%");
        this.loadCore();
    }

    // noinspection JSUnusedGlobalSymbols
    onUpdate() {
        const value = this.doc.getValue();
        let problems = this.handleSetContent(value);
        if (problems == null)
            problems = this.handleEditContent(value);
        this.$value = value;
        // changing the below requires evolving PromptoChangeManager
        this.sender.emit("annotate", problems);
    }

    progress(text) {
        this.sender.emit("progressed", text);
    }

    loadCore() {
        this.markLoading("Core");
        this.progress( "Fetching Core code");
        Fetcher.instance.getTEXT("/prompto/prompto.pec", null, text => {
            this.progress("Loading Core code");
            this.$repo.registerLibraryCode(text, "E");
            this.markLoaded("Core");
        });
    }

    setProject(projectId, loadDependencies) {
        this.$projectId = projectId;
        this.unpublishProject();
        this.loadProject(loadDependencies);
    }

    setContent(content, clearValue) {
        this.$selected = content;
        if(clearValue) {
            this.$value = null; // next update will be setting the value
            this.$repo.reset();
        }
    }

    handleSetContent(value) {
        if (this.$value)
            return null;
        if (this.$selected && value.length) {
            const errorListener = new globals.AnnotatingErrorListener();
            this.$repo.handleSetContent(value, this.$dialect, errorListener);
            return errorListener.problems;
        } else
            return null;
    }

    handleEditContent(value) {
        if(value !== this.$value) {
            const errorListener = new globals.AnnotatingErrorListener();
            const delta = this.$repo.handleEditContent(value, this.$dialect, errorListener, this.$selected);
            if (delta) {
                const data = convertObjectToDocument(delta);
                this.sender.emit("catalogUpdated", data);
            } else if(this.$selected)
                this.sender.emit("bodyEdited", this.$selected);
            return errorListener.problems;
        } else
            return [];
    }

    setDialect(dialect) {
        const old = this.$dialect;
        this.$dialect = dialect;
        if(old && dialect!==old) {
            const value = this.doc.getValue();
            if(value) {
                // remember value since it does not result from an edit
                this.$value = this.$repo.translate(value, old, dialect);
                this.sender.emit("value", this.$value);
            }
        }
    }

    getContentBody(content) {
        const callbackId = arguments[arguments.length - 1]; // callbackId is added by ACE
        const body = content ? this.$repo.getContentBody(content, this.$dialect) : "";
        this.sender.callback(body, callbackId);
    }

    getEditedContents(contents) {
        const callbackId = arguments[arguments.length - 1]; // callbackId is added by ACE
        const edited = this.$repo.getEditedDeclarations(contents);
        this.sender.callback(edited, callbackId);
    }

    createBreakpointAtLine(line) {
        const callbackId = arguments[arguments.length - 1]; // callbackId is added by ACE
        const brkpt = this.$selected ? this.$repo.createBreakpointAtLine(this.$selected, line, this.$dialect) : null;
        this.sender.callback(brkpt, callbackId);
    }

    // noinspection JSUnusedGlobalSymbols
    contentForStackFrame(stackFrame) {
        const callbackId = arguments[arguments.length - 1]; // callbackId is added by ACE
        const content = this.$repo.contentForStackFrame(stackFrame);
        this.sender.callback(content, callbackId);
    }

    // noinspection JSUnusedGlobalSymbols
    destroyContent(content) {
        this.$value = "";
        const delta = this.$repo.handleDestroyed(content);
        if(delta) {
            const data = convertObjectToDocument(delta.getContent());
            this.sender.emit("catalogUpdated", data);
        }
        this.sender.emit("value", this.$value);
    }

    loadProject(loadDependencies) {
        this.progress("Fetching project description");
        PromptoWorker.fetchProjectDescription(this.$projectId, true, response => {
            if (response.error)
                this.handleError(response.error);
            else {
                this.progress( "Fetching project description complete");
                this.$project = response.data.value;
                if (loadDependencies)
                    this.loadDependencies();
                // noinspection JSUnresolvedVariable
                if (this.$project.stubResource) try {
                    // resource location is absolute
                    globals.importScripts("/stub?moduleId=" + this.$project.dbId + "&resourceName=" + this.$project.stubResource);
                } catch(e) {
                    // TODO something
                    const trace = e.stack;
                    console.error(trace);
                }
                this.markLoaded("%Description%");
                this.progress("Fetching project code");
                PromptoWorker.fetchModuleDeclarations(this.$projectId, response => {
                    if (response.error)
                        this.handleError(response.error);
                    else {
                        this.progress( "Parsing project code");
                        const cursor = response.data.value;
                        this.$repo.registerProjectDeclarations(this.$projectId, cursor.items, this.progress.bind(this));
                        this.markLoaded("Project");
                    }
                });
            }
        });
    }

    loadDependencies() {
        if(this.$project.dependencies) {
            this.$project.dependencies.value
                .filter(dep => dep!=null)
                .map(dep=>this.loadDependency(dep.value || dep), this);
        }
    }


    loadDependency(dependency) {
        this.markLoading(dependency.name);
        PromptoWorker.fetchModuleDescription(dependency.name, dependency.version, response => {
            if(response.error)
                this.handleError(response.error);
            else {
                const library = response.data.value;
                // noinspection JSUnresolvedVariable
                if(library.stubResource) {
                    try {
                        // resource location is absolute
                        globals.importScripts("/stub?moduleId=" + library.dbId + "&resourceName=" + library.stubResource);
                    } catch(e) {
                        // TODO something
                        const trace = e.stack;
                        console.error(trace);
                    }
                }
                this.progress( "Fetching " + dependency.name + " code");
                PromptoWorker.fetchModuleDeclarations(library.dbId, response => {
                    if (response.error)
                        this.handleError(response.error);
                    else {
                        this.progress( "Parsing " + dependency.name + " code");
                        const cursor = response.data.value;
                        this.$repo.registerLibraryDeclarations(cursor.items);
                        this.markLoaded(dependency.name);
                    }
                });
            }
        });
    }

    handleError(error) {
        // TODO
    }

    // TODO reconnect this stuff
    // noinspection JSUnusedGlobalSymbols
    dependenciesUpdated() {
        this.$repo.clearLibrariesContext();
        this.markLoading("Project");
        // fake 'library' to ensure libraries are published only once dependencies are loaded
        this.markLoading("%Description%");
        this.loadCore();
        this.loadProject(true);
    }

    static fetchProjectDescription(projectId, register, success) {
        const params = [ {name:"dbId", value:projectId.toString()}, {name:"register", type:"Boolean", value:register}];
        const url = '/ws/run/fetchModuleDescription';
        Fetcher.instance.getJSON(url, { params: JSON.stringify(params) }, success);
    }

    static fetchModuleDescription(name, version, success) {
        const params = [ {name:"name", type:"Text", value:name}, {name:"version", type:version.type, value:version.value}, {name:"register", type:"Boolean", value:false} ];
        const url = '/ws/run/fetchModuleDescription';
        Fetcher.instance.getJSON(url, { params: JSON.stringify(params) }, success);
    }

    static fetchModuleDeclarations(moduleId, success) {
        const params = [ {name:"dbId", value:moduleId.toString()}];
        const url = '/ws/run/fetchModuleDeclarations';
        Fetcher.instance.getJSON(url, { params: JSON.stringify(params) }, success);
    }


    publishLibraries(complete) {
        const catalog = this.$repo.publishLibraries();
        this.sender.emit("catalogLoaded", [ catalog, complete ]);
    }

    publishProject(complete) {
        const catalog = this.$repo.publishProject();
        this.sender.emit("catalogLoaded", [ catalog, complete ]);
    }

    unpublishProject() {
        const catalog = this.$repo.unpublishProject();
        this.sender.emit("catalogLoaded", [ catalog, false ]);
    }

    markLoading(name) {
        this.$loading[name] = true;
    }

    markLoaded (name) {
        if(name !== "%Description%")
            this.progress( "Loading " + name + " complete");
        delete this.$loading[name];
        const complete = Object.keys(this.$loading).length === 0;
        // is this the Project ?
        if(name==="Project")
            this.publishProject(complete);
        // is this the last library ?
        else if (Object.keys(this.$loading).length === 1 && "Project" in this.$loading)
            this.publishLibraries(complete);
        // is this the last loading
        else if (complete)
            this.publishLibraries(complete);
    }

    markChangesCommitted() {
        PromptoWorker.fetchModuleDeclarations(this.$projectId, response => {
            if (response.error)
                this.handleError(response.error);
            else {
                const cursor = response.data.value;
                this.$repo.markChangesCommitted(cursor.items);
                this.$repo.clearDeleted();
             }
        });
    }

    runMethod(methodRef) {
        const callbackId = arguments[arguments.length - 1]; // callbackId is added by ACE
        const oldLog = console.log;
        console.log = this.progress.bind(this);
        const runner = new LocalInterpreter();
        try {
            runner.runMethod(this.$repo, methodRef, () => this.sender.callback(null, callbackId));
        } finally {
            console.log = oldLog;
        }

    }

    runTest(testRef) {
        const callbackId = arguments[arguments.length - 1]; // callbackId is added by ACE
        const oldLog = console.log;
        console.log = this.progress.bind(this);
        const runner = new LocalInterpreter();
        try {
            runner.runTest(this.$repo, testRef, () => this.sender.callback(null, callbackId));
        } finally {
            console.log = oldLog;
        }
    }


}