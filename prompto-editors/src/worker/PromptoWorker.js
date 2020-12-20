import Mirror from '../ace/Mirror';
import Repository from '../code/Repository';
import Defaults from '../code/Defaults';
import Fetcher from '../utils/Fetcher';
import LocalRunners from "../runner/LocalRunners";
import {convertObjectToDocument} from "../code/CodeUtils";

// eslint-disable-next-line
const globals = self || window;
const prompto = globals.prompto;

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

    onInit() {
        this.markLoading("Project");
        // fake 'library' to ensure libraries are published only once dependencies are loaded
        this.markLoading("%Description%");
        this.loadCore();
    }

    loadCore() {
        this.markLoading("Core");
        Fetcher.instance.getTEXT("prompto/prompto.pec", null, text => {
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

    onUpdate() {
        const value = this.doc.getValue();
        let problems = this.handleSetContent(value);
        if (problems == null)
            problems = this.handleEditContent(value);
        this.$value = value;
        // changing the below requires evolving PromptoChangeManager
        this.sender.emit("annotate", problems);
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
        var old = this.$dialect;
        this.$dialect = dialect;
        if(old && dialect!==old) {
            var value = this.doc.getValue();
            if(value) {
                // remember value since it does not result from an edit
                this.$value = this.$repo.translate(value, old, dialect);
                this.sender.emit("value", this.$value);
            }
        }
    }

    getContentBody(resource) {
        const callbackId = arguments[arguments.length - 1]; // callbackId is added by ACE
        const body = resource ? this.$repo.getDeclarationBody(resource, this.$dialect) : "";
        this.sender.callback(body, callbackId);
    }

    locateContent(stackFrame) {
        const callbackId = arguments[arguments.length - 1]; // callbackId is added by ACE
        const content = this.$repo.locateContent(stackFrame);
        this.sender.callback(content, callbackId);
    }

    locateSection(breakpoint) {
        const callbackId = arguments[arguments.length - 1]; // callbackId is added by ACE
        const section = this.$repo.locateSection(breakpoint);
        this.sender.callback(section, callbackId);
    }

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
        this.fetchProjectDescription(this.$projectId, true, response => {
            if (response.error)
                ; // TODO something
            else {
                this.$project = response.data.value;
                if (loadDependencies)
                    this.loadDependencies();
                if (this.$project.stubResource) try {
                    // resource location is absolute
                    globals.importScripts("/stub?moduleId=" + this.$project.dbId + "&resourceName=" + this.$project.stubResource);
                } catch(e) {
                    // TODO something
                    const trace = e.stack;
                    console.error(trace);
                }
                this.markLoaded("%Description%");
                this.fetchModuleDeclarations(this.$projectId, response => {
                    if (response.error)
                        ; // TODO something
                    else {
                        const cursor = response.data.value;
                        this.$repo.registerProjectDeclarations(this.$projectId, cursor.items);
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
        this.fetchModuleDescription(dependency.name, dependency.version, response => {
            if(response.error)
                ; // TODO something
            else {
                const library = response.data.value;
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
                this.fetchModuleDeclarations(library.dbId, response => {
                    if (response.error)
                        ; // TODO something
                    else {
                        const cursor = response.data.value;
                        this.$repo.registerLibraryDeclarations(cursor.items);
                        this.markLoaded(dependency.name);
                    }
                });
            }
        });
    }

    dependenciesUpdated() {
        this.$repo.clearLibrariesContext();
        this.markLoading("Project");
        // fake 'library' to ensure libraries are published only once dependencies are loaded
        this.markLoading("%Description%");
        this.loadCore();
        this.loadProject(true);
    }

    fetchProjectDescription(projectId, register, success) {
        const params = [ {name:"dbId", value:projectId.toString()}, {name:"register", type:"Boolean", value:register}];
        const url = '/ws/run/fetchModuleDescription';
        Fetcher.instance.getJSON(url, { params: JSON.stringify(params) }, success);
    }

    fetchModuleDescription(name, version, success) {
        const params = [ {name:"name", type:"Text", value:name}, {name:"version", type:version.type, value:version.value}, {name:"register", type:"Boolean", value:false} ];
        const url = '/ws/run/fetchModuleDescription';
        Fetcher.instance.getJSON(url, { params: JSON.stringify(params) }, success);
    }

    fetchModuleDeclarations(moduleId, success) {
        const params = [ {name:"dbId", value:moduleId.toString()}];
        const url = '/ws/run/fetchModuleDeclarations';
        Fetcher.instance.getJSON(url, { params: JSON.stringify(params) }, success);
    }


    publishLibraries() {
        var catalog = this.$repo.publishLibraries();
        this.sender.emit("catalogLoaded", catalog);
    }

    publishProject() {
        var catalog = this.$repo.publishProject();
        this.sender.emit("catalogLoaded", catalog);
    }

    unpublishProject() {
        var catalog = this.$repo.unpublishProject();
        this.sender.emit("catalogLoaded", catalog);
    }

    markLoading(name) {
        this.$loading[name] = true;
    }

    markLoaded (name) {
        delete this.$loading[name];
        // is this the Project ?
        if(name==="Project")
            this.publishProject();
        // is this the last library ?
        else if (Object.keys(this.$loading).length === 1 && "Project" in this.$loading)
            this.publishLibraries();
        // is this the last loading
        else if (Object.keys(this.$loading).length === 0)
            this.publishLibraries();
    }

    prepareCommit() {
        const callbackId = arguments[arguments.length - 1]; // callbackId is added by ACE
        const declarations = this.$repo.prepareCommit();
        this.sender.callback(declarations, callbackId);
    }

    commitFailed() {
        // keep state as is
    }

    commitSuccessfull() {
        this.fetchModuleDeclarations(this.$projectId, response => {
            if (response.error)
                ; // TODO something
            else {
                const cursor = response.data.value;
                this.$repo.registerCommitted(cursor.items);
             }
        });
    }

    runTestOrMethod(content, mode) {
        const callbackId = arguments[arguments.length - 1]; // callbackId is added by ACE
        const runner = LocalRunners.forMode(mode);
        if(runner)
            runner.runContent(this.$projectId, this.$repo, content, ()=>this.sender.callback(null, callbackId));
        else {
            console.log("Unsupported mode: " + mode);
            this.sender.callback(null, callbackId);
        }
    }


    fetchRunnablePage(content) {
        const callbackId = arguments[arguments.length - 1]; // callbackId is added by ACE
        var runnable = { valid: false, content: null };
        var decl = this.$repo.getDeclaration(content);
        if(decl!==null && decl.annotations && decl instanceof prompto.declaration.ConcreteWidgetDeclaration) {
            var annotations = decl.annotations.filter(function(a) { return a.id.name==="@PageWidgetOf" });
            if(annotations.length>0) {
                var expression = annotations[0].getDefaultArgument();
                if (expression instanceof prompto.literal.TextLiteral) {
                    runnable = {valid: true, content: {type: "page", name: expression.value.toString()}};
                }
            }
        }
        this.sender.callback(runnable, callbackId);
    }
}