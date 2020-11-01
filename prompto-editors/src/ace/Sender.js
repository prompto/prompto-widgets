import EventEmitter from './EventEmitter';

export default class Sender extends EventEmitter {

    callback (data, callbackId) {
        postMessage({
            type: "call",
            id: callbackId,
            data: data
        });
    }

    emit(name, data) {
        postMessage({
            type: "event",
            name: name,
            data: data
        });
    }
}
