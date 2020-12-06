import {convertDocumentToObject, getCodebaseLength} from './CodeUtils';

let prompto = null;

/* need a deferred function for testing with Jest */
function linkPrompto() {
    // eslint-disable-next-line
    const globals = global || window || self || this;
    prompto = globals.prompto;
}

/* an object which represents a catalog of declarations, classified by type */
export default class Catalog {

    constructor(decls, globalContext, filterContext) {
        linkPrompto();
        this.readCatalog(globalContext, decls);
        if (filterContext)
            this.filterOutDeclarations(filterContext);
    }

    length() {
        return getCodebaseLength(this);
    }


    readCatalog(globalContext, decls) {
        const content = this.loadCatalog(globalContext, decls);
        this.attributes = content.attributes;
        this.categories = content.categories;
        this.enumerations = content.enumerations;
        this.methods = content.methods;
        this.tests = content.tests;
        this.widgets = content.widgets;
    }

    loadCatalog(globalContext, decls) {
        if (prompto && decls) {
            const context = prompto.runtime.Context.newGlobalsContext();
            // need a fresh context to ensure all get registered
            context.problemListener = new prompto.problem.ProblemCollector(); // we'll ignore these errors but let's catch them
            decls.register(context);
            context.globals = globalContext;
            const catalog = context.getLocalCatalog();
            return convertDocumentToObject(catalog);
        } else
            return {};
    }

    filterOutDeclarations(filterContext) {
        this.filterOutObjects("attributes", filterContext);
        this.filterOutMethods(filterContext);
        this.filterOutObjects("categories", filterContext);
        this.filterOutObjects("enumerations", filterContext);
        this.filterOutObjects("tests", filterContext);
        this.filterOutObjects("widgets", filterContext);
    }

    filterOutObjects(type, filterContext) {
        if (this[type])
            this[type] = this[type].filter(name => filterContext.contextForDeclaration(name) === null);
    }

    filterOutMethods(filterContext) {
        if (this.methods)
            this.methods = this.methods.filter(method => this.filterOutMethod(method, filterContext));
    }

    filterOutMethod(method, filterContext) {
        const context = filterContext.contextForDeclaration(method.name);
        if (context === null)
            return true;
        // if core has such method, need to check protos
        if (method.protos.length === 1)
            return false;
        const map = filterContext.getRegisteredDeclaration(method.name);
        method.protos = method.protos.filter(proto=> !map.hasPrototype(proto.proto));
        return method.protos.length > 0;
    }

}