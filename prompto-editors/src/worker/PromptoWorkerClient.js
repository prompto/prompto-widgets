// eslint-disable-next-line
import PromptoWorkerThread from "worker-loader!./PromptoWorkerThread";
import PromptoChangeManager from "./PromptoChangeManager";
// import { print } from '../utils/Utils';
import PromptoMarker from "./PromptoMarker.js";

export default class PromptoWorkerClient extends window.ace.acequire("ace/worker/worker_client")
    .WorkerClient {

    constructor(editor, dialect) {
        // need to patch Worker in order to call compile-time url
        // must be done inline due to call to super
        const savedWorker = window.Worker;
        try {
            window.Worker = function() {
                window.Worker = savedWorker;
                return new PromptoWorkerThread();
            }
            super(["ace"], "ace/worker/prompto", "PromptoWorker", "./PromptoWorkerThread"); // script will be ignored
        } finally {
            window.Worker = savedWorker;
        }
        // done with the hacky stuff
        this.$worker.onmessage = this.messageHook.bind(this);
        this.$editor = editor;
        this.addEventListeners(["errors", "annotate", "terminate", "value", "progressed", "catalogLoaded", "catalogUpdated", "bodyEdited"]);
        this.attachToDocument(this.getSession().getDocument());
        this.send("setDialect", [ dialect ] );
        this.changeMgr = new PromptoChangeManager(super.emit.bind(this));
    }

    emit(event, data) {
        this.changeMgr.processEvent(event, data);
    }

    messageHook(msg) {
        this.changeMgr.processMessage(msg);
        if(msg.data.type === "log")
            ; // print(msg.data.data);
        else
            this.onMessage(msg);
    }

    setDialect(dialect) {
        this.changeMgr.setDialect(dialect);
        this.send("setDialect", [ dialect ] );
    }

    getEditor() {
        return this.$editor.getEditor();
    }

    getSession() {
        return this.getEditor().getSession();
    }

    addEventListeners(types) {
        types.forEach(type=>{
            const methodName = "on" + type[0].toUpperCase() + type.substring(1);
            this[methodName] = this[methodName].bind(this);
            this.on(type, this[methodName]);
        }, this);
    }

    onErrors(e) {
        this.getSession().setAnnotations(e.data);
    }

    onAnnotate(e) {
        this.getSession().setAnnotations(e.data);
        this.clearMarkers();
        this.createMarkers(e.data);
    }

    clearMarkers() {
        const session = this.getSession();
        const markers = session.getMarkers(true);
        for(let marker in markers)
            session.removeMarker(marker);
    }

    createMarkers(data) {
        const markers = PromptoMarker.compute(data);
        const session = this.getSession();
        markers.forEach(marker => session.addMarker(marker, "ace_" + marker.type + "-word", "text", true));
    }

    onTerminate() {
        this.getSession().clearAnnotations();
    }

    onValue(v) {
        const session = this.getSession();
        const changed = session.getValue()!==v.data;
        if(changed) {
            session.setValue(v.data);
            this.getEditor().focus();
        }
        return changed;
    }

    onProgressed(v) {
        this.getSession().getMode().onProgressed(v.data);
    }

    onCatalogLoaded(v) {
        const catalog = window.readJSONValue(v.data[0]);
        const complete = window.readJSONValue(v.data[1]);
        this.getSession().getMode().onCatalogLoaded(catalog, complete);
    }

    onCatalogUpdated(v) {
        const delta = window.readJSONValue(v.data);
        this.getSession().getMode().onCatalogUpdated(delta);
    }

    onBodyEdited(v) {
        const data = { type: v.data.type, value: v.data };
        delete data.value.type;
        const content = window.readJSONValue(data);
        this.getSession().getMode().onBodyEdited(content);
    }

}