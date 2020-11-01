// eslint-disable-next-line
import PromptoWorkerThread from "worker-loader!./PromptoWorkerThread";
// import { print } from '../utils/Utils';
// import PromptoMarker from "./PromptoMarker";
// import PromptoChangeManager from "./PromptoChangeManager";

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
        this.addEventListeners(["errors", "annotate", "terminate", "value", "catalogUpdated", "contentUpdated", "inspected"]);
        this.attachToDocument(this.getSession().getDocument());
        this.send("setDialect", [ dialect ] );
        // this.changeMgr = new PromptoChangeManager(super.emit.bind(this));
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

    setContent(content, callback) {
        this.changeMgr.setContent(content);
        var self_ = this;
        this.call("setContent", [ content ], value => {
            const changed = self_.onValue({ data: value });
            if(callback)
                callback(changed);
        });
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
        // const markers = PromptoMarker.compute(data);
        // const session = this.getSession();
        // markers.forEach(marker => session.addMarker(marker, "ace_" + marker.type + "-word", "text", true));
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

    onCatalogUpdated(v) {
        this.getSession().getMode().onCatalogUpdated(v.data);
    }

    onContentUpdated(v) {
        this.getSession().getMode().onContentUpdated(v.data);
    }

    // a utility method to inspect worker data in Firefox/Safari
    onInspected(v) {
        console.log("onInspected");
        // parent.inspected(v.data);
    }
}