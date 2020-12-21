// eslint-disable-next-line
const globals = global || self || this;

/* a function for inferring dialect from file extension */
export const inferDialect = function(path) {
    return path.substring(path.length-2, path.length-1).toUpperCase();
};

/* a function for getting a new prompto code parser */
export const newParser = function(input, dialect, listener) {
    const prompto = globals.prompto;
    const klass = prompto.parser[dialect + "CleverParser"];
    const parser = new klass(input);
    parser.removeErrorListeners();
    if(listener)
        parser.addErrorListener(listener);
    return parser;
};

/* a function for parsing prompto code into declarations */
export const parse = function(input, dialect, listener) {
    const parser = newParser(input, dialect, listener);
    const decls = parser.parse();
    decls.forEach( decl => {
        decl.sourceCode = { dialect: dialect, body: decl.fetchBody(parser) };
    });
    return decls;
};

/* a function for producing code from a declaration object */
export const unparse = function(context, decl, dialect) {
    const prompto = globals.prompto;
    const d = prompto.parser.Dialect[dialect];
    const writer = new prompto.utils.CodeWriter(d, context.newChildContext());
    // avoid throwing since this would stop the translation
    writer.context.problemListener = new prompto.problem.ProblemCollector();
    if(decl.comments)
        decl.comments.forEach(cmt => cmt.toDialect(writer));
    if(decl.annotations)
        decl.annotations.forEach(ann => ann.toDialect(writer));
    decl.toDialect(writer);
    return writer.toString();
};

/* a function for translating current input to other dialect */
export const translate = function(context, data, from, to) {
    const prompto = globals.prompto;
    const decls = parse(data, from); // could be cached
    const dialect = prompto.parser.Dialect[to];
    const writer = new prompto.utils.CodeWriter(dialect, context.newChildContext());
    decls.toDialect(writer);
    return writer.toString();
};

/* a utility function to sort by field name */
export const sortBy = function(a, f) {
    return a.sort(function(i1,i2) {
        return (i1[f]>i2[f]) ? 1 : ((i1[f]<i2[f]) ? -1 : 0);
    });
};

export const makeValidId = function(name) {
    /*eslint no-useless-escape: "off"*/
    return name.replace(/[ /\.]/g, "_").replace(/[\"\'\(\),]/g,"");
};

/* use global functions so we can call it on serialized data */
export const getCodebaseLength = function(codebase) {
    if(!codebase)
        return 0;
    let length = 0;
    for(let name in codebase) {
        if(Array.isArray(codebase[name]))
            length += codebase[name].length;
    }
    return length;
};

export const getFirstCodebaseEntry = function(codebase) {
    if(!codebase)
        return null;
    for(let name in codebase) {
        if(Array.isArray(codebase[name]) && codebase[name].length > 0)
            return { key: name, value: codebase[name][0] };
    }
    return null;
};

export const getContentFromEntry = function(entry) {
    const subType = entry.key==="categories" ? "category" : entry.key.substring(0, entry.key.length-1);
    let content = { type: "prompto", subType: subType, core: false };
    switch(subType) {
        case "method":
            content.name = entry.value.name;
            content.proto = entry.value.protos[0].proto;
            break;
        case "enumeration":
            content.name = entry.value.name;
            break;
        default:
            content.name = entry.value;
    }
    return content;
}

function recursivelyConvertDocumentToObject(object) {
    if(!object)
        return object;
    if(Array.isArray(object))
        return object.map(recursivelyConvertDocumentToObject);
    if(typeof(object) === typeof({})) {
        const result = {};
        if(object.type==="Document" && object.value)
            object = object.value;
        Object.getOwnPropertyNames(object).forEach(name => result[name] = recursivelyConvertDocumentToObject(object[name]), this);
        return result;
    }
    return object;
}

export const convertDocumentToObject = recursivelyConvertDocumentToObject;

function recursivelyConvertObjectToDocument(object) {
    if(!object)
        return object;
    if(Array.isArray(object))
        return object.map(recursivelyConvertObjectToDocument);
    if(typeof(object) === typeof({})) {
        const result = {};
        Object.getOwnPropertyNames(object).forEach(name => result[name] = recursivelyConvertObjectToDocument(object[name]), this);
        return { type: "Document", value: result };
    }
    return object;
}


export const convertObjectToDocument = recursivelyConvertObjectToDocument;