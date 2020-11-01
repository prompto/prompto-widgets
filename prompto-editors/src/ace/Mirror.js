import Document from './Document';
import { delayedCall } from './lang';

export default class Mirror {
    
    constructor(sender) {
        this.sender = sender;
        this.$timeout = 0;
        this.doc = new Document("");
        this.deferredUpdate = delayedCall(this.onUpdate.bind(this));
        sender.on("change", this.processChange.bind(this));
        sender.on("changes", this.processChanges.bind(this));
    }

    processChanges(data) {
        var changes = data.data;
        for (var i = 0; i < changes.length; i ++) {
            this.applyChange(changes[i]);
        }
        return this.invokeUpdate();
    }

    processChange(data) {
        var change = data.data;
        this.applyChange(change);
        return this.invokeUpdate();
    }

    invokeUpdate() {
        if (this.$timeout)
            return this.deferredUpdate.schedule(this.$timeout);
        else
            this.onUpdate();
    }

    applyChange(data) {
        var doc = this.doc;
        if (data[0].start) {
            doc.applyDeltas(data);
        } else {
            for (var i = 0; i < data.length; i += 2) {
                var d = Array.isArray(data[i+1]) ?
                    {action: "insert", start: data[i], lines: data[i+1]}
                    : {action: "remove", start: data[i], end: data[i+1]};
                doc.applyDelta(d, true);
            }
        }
    }


    setTimeout(timeout) {
        this.$timeout = timeout;
    }

    setValue(value) {
        this.doc.setValue(value);
        this.deferredUpdate.schedule(this.$timeout);
    }

    getValue(callbackId) {
        this.sender.callback(this.doc.getValue(), callbackId);
    }

    onUpdate() {
        // abstract method
    }

    isPending() {
        return this.deferredUpdate.isPending();
    }

}