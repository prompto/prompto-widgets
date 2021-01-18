import Runner from "./Runner";

// eslint-disable-next-line
const globals = self || window;
const prompto = globals.prompto;

export default class LocalInterpreter extends Runner {

    runMethod(repo, methodRef, callback) {
        try {
            prompto.runtime.Interpreter.interpret(repo.projectContext, methodRef.name, "");
        } finally {
            callback();
        }
    }

    runTest(repo, testRef, callback) {
        const store = prompto.store.$DataStore.instance;
        prompto.store.$DataStore.instance = new prompto.memstore.MemStore();
        try {
            prompto.runtime.Interpreter.interpretTest(repo.projectContext, testRef.name);
        } finally {
            prompto.store.$DataStore.instance = store;
            callback();
        }
    }

}
