import './Globals';
import Sender from '../ace/Sender';
import PromptoWorker from './PromptoWorker';

var sender = new Sender();
var worker = new PromptoWorker(sender);

// eslint-disable-next-line
const globals = self;

onmessage = function(e) {
    var msg = e.data;
    if (msg.event && sender) {
        sender._signal(msg.event, msg.data);
    } else if (msg.command) {
        if (worker[msg.command])
            worker[msg.command].apply(worker, msg.args);
        else if (globals[msg.command])
            globals[msg.command].apply(globals, msg.args);
        else
            throw new Error("Unknown command: " + msg.command);
    } else if (msg.init) {
        // console.log("init");
    }
};
