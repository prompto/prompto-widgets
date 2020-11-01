/*
ACE already provides delayed processing of code changes, see Mirror.js
However, it suffers from 2 deadly flaws:
 - it runs in the worker, which makes it very difficult to tune
 - it is not scenario aware, meaning it will delay every processing
 The below aims to overcome the above as follows:
  - timeout in mirror is set to 0 = no delay in order to regain control
  - changes are accumulated on editor side, and sent to worker only once previous processing is complete
  - changes can be forced when changing context
 */
export default class PromptoChangeManager {

    constructor(emit) {
        this.emit = emit;
        this.processing = 0;
        this.pendingChanges = [];
        // below relate to deferred execution
        this.scheduledChanges = null;
        this.timeout = 100;
        this.timerId = null;
    }

    processEvent(event, data) {
        if (event === "change") {
            this.mergeChange(data);
            this.sendPendingChanges(false);
        } else
            this.emit(event, data);
    }

    processMessage(msg) {
        // "annotate" is the last message always sent by PromptoWorker.onUpdate
        if(msg.data.name === "annotate") {
            this.processing = Math.max(this.processing - 1, 0);
            if(this.canSendPendingChanges(false))
                this.emitPendingChanges();
        }
    }

    mergeChange(data) {
        this.pendingChanges.push(data.data);
    }

    sendPendingChanges(force) {
        if (this.canSendPendingChanges(force))
            this.doSendPendingChanges(force);
    }

    canSendPendingChanges(force) {
        if(!this.pendingChanges.length)
            return false;
        else
            return force || this.processing === 0;
    }

    doSendPendingChanges(force) {
        if(!this.timeout)
            this.emitPendingChanges();
        else {
            this.cancelScheduledChanges();
            if(force)
                this.emitPendingChanges();
            else
                this.scheduleChanges();
        }
    }

    scheduleChanges() {
        this.timerId = setTimeout(function() {
            this.scheduledChanges = this.pendingChanges;
            this.emitPendingChanges();
            this.scheduledChanges = null;
            this.timerId = null;
        }.bind(this), this.timeout);
    }

    cancelScheduledChanges() {
        if(this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
            if(this.scheduledChanges)
                this.pendingChanges = this.scheduledChanges.concat(this.pendingChanges);
            this.scheduledChanges = null;
        }
    }

    emitPendingChanges() {
        this.processing += 1;
        var data = this.pendingChanges;
        this.pendingChanges = [];
        this.emit("changes", { data: data });
    }

    setDialect(dialect) {
        this.sendPendingChanges(true);
    }

    setContent(content, callback) {
        this.sendPendingChanges(true);
    }

}