import Runner from "./Runner";

// eslint-disable-next-line
const globals = self || window;
const prompto = globals.prompto;

export default class LocalInterpreter extends Runner {

    runContent(projectId, repo, content, callback) {
        if (content.subType === "test")
            this.runTest(repo, content, callback);
        else
            this.runMethod(repo, content, callback);
    }

    runTest(repo, content, callback) {
        const store = prompto.store.$DataStore.instance;
        prompto.store.$DataStore.instance = new prompto.memstore.MemStore();
        try {
            prompto.runtime.Interpreter.interpretTest(repo.projectContext, content.name);
        } finally {
            prompto.store.$DataStore.instance = store;
            callback();
        }
    }

    runMethod(repo, content, callback) {
        try {
            prompto.runtime.Interpreter.interpret(repo.projectContext, content.name, "");
            console.log("Finished running " + content.name);
        } finally {
            callback();
        }
    }
}
