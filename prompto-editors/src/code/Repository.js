import { parse, unparse, newParser, translate } from './CodeUtils';
import Catalog from "./Catalog";
import Delta from "./Delta";

let prompto = null;
let profiling = false;

/* need a deferred function for testing with Jest */
function linkPrompto() {
    // eslint-disable-next-line
    const globals = global || window || self || this;
    prompto = globals.prompto;
}



/* a class to maintain an up-to-date copy of the repository */
/* which can be used to detect required changes in the UI, and deltas to commit */
export default class Repository {

    constructor() {
        linkPrompto();
        this.librariesContext = prompto.runtime.Context.newGlobalsContext();
        this.projectContext = prompto.runtime.Context.newGlobalsContext();
        this.projectContext.setParentContext(this.librariesContext);
        this.moduleId = null;
        this.lastSuccess = new prompto.declaration.DeclarationList(); // last piece of code successfully registered through handleUpdate
        this.statuses = {};
    }

    reset() {
        this.lastSuccess = new prompto.declaration.DeclarationList();
    }

    registerLibraryCode(code, dialect) {
        var decls = parse(code, dialect);
        decls.register(this.librariesContext);
    }

    registerLibraryDeclarations(declarations) {
        declarations.forEach(obj => {
            var decls = parse(obj.value.body, obj.value.dialect);
            decls.register(this.librariesContext);
        }, this);
    }

    clearLibrariesContext() {
        this.librariesContext = prompto.runtime.Context.newGlobalsContext();
        this.projectContext.setParentContext(this.librariesContext);
    }


    publishLibraries() {
        return { type: "Document",
                value: {
                    removed: { type: "Document", value: {} },
                    added: this.librariesContext.getCatalog(),
                    library: true
                }};
    }


    publishProject() {
        return { type: "Document",
                value: {
                    removed: { type: "Document", value: {} },
                    added: this.projectContext.getLocalCatalog(),
                    project: true
                }};
    }


    unpublishProject() {
        var delta = { type: "Document",
                    value: {
                        removed: this.projectContext.getLocalCatalog(),
                        added: { type: "Document", value: {}}
                    }};
        this.projectContext = prompto.runtime.Context.newGlobalsContext();
        this.projectContext.setParentContext(this.librariesContext);
        this.statuses = {};
        return delta;
    }

    registerProjectDeclarations(moduleId, declarations, progress) {
        const totalCount = declarations.length;
        let actualCount = 0;
        this.moduleId = moduleId;
        declarations.forEach(obj => {
            var decl = parse(obj.value.body, obj.value.dialect);
            decl.register(this.projectContext);
            if(progress)
                progress("Parsing project code " + (++actualCount) + "/" + totalCount);
            // prepare for commit
            var module = obj.value.module;
            if (module) {
                // avoid sending back large objects
                delete obj.value.module.value.dependencies;
                delete obj.value.module.value.image;
            }
            this.registerClean(obj);
        }, this);
    }

    getContentBody(content, dialect) {
        var decl = this.getDeclaration(content);
        return this.getDeclarationBody(decl, dialect);
    }


    getDeclarationBody(decl, dialect) {
        if(decl.sourceCode && decl.sourceCode.dialect === dialect)
            return decl.sourceCode.body;
        else
            return unparse(this.projectContext, decl, dialect);
    }

    getDeclaration(content) {
        if (content.type === "TestRef")
            return this.projectContext.getRegisteredTest(content.name);
        else if (content.type === "MethodRef") {
            var methodsMap = this.projectContext.getRegisteredDeclaration({name: content.name});
            return methodsMap.protos[content.prototype || ""] || methodsMap.getFirst();
        } else
            return this.projectContext.getRegisteredDeclaration({name: content.name});
    }

    /* dbDecl = object received from the server */
    idFromDbDecl(dbDecl) {
        if (dbDecl.type === "MethodDeclaration")
            return dbDecl.value.name + "/" + (dbDecl.value.prototype || "");
        else
            return dbDecl.value.name;
    }


    /* id = object received from the UI */
    idFromContent(content) {
        if (content.type === "MethodRef")
            return content.name + "/" + (content.prototype || "");
        else
            return content.name;
    }

    /* decl = object received from the parser */
    idFromDecl(decl) {
        return decl.name + (decl.getProto !== undefined ? "/" + (decl.getProto() || "") : "");
    }

    registerClean(obj) {
        var id = this.idFromDbDecl(obj);
        this.statuses[id] = {resource: obj, editStatus: "CLEAN"};
    }


    registerDestroyed(id) {
        var obj_status = this.statuses[id];
        if (obj_status)
            obj_status.editStatus = "DELETED";
    }


    registerDirty(decls, parser, dialect) {
        decls.forEach(decl => {
            var decl_obj;
            var id = this.idFromDecl(decl);
            var existing = this.statuses[id];
            if (existing) {
                decl_obj = existing.resource.value;
                var body = decl.fetchBody(parser);
                if (decl_obj.dialect !== dialect || decl_obj.body !== body) {
                    decl_obj.dialect = dialect;
                    decl_obj.body = body;
                    if (existing.editStatus !== "CREATED") // don't overwrite
                        existing.editStatus = "DIRTY";
                    if (decl.getProto !== undefined)
                        decl_obj.prototype = decl.getProto();
                    if (decl.storable !== undefined)
                        decl_obj.storable = decl.storable;
                    if (decl.symbols)
                        decl_obj.symbols = decl.symbols.map(function (s) {
                            return s.name;
                        });
                    if (decl.derivedFrom)
                        decl_obj.derivedFrom = decl.derivedFrom.map(function (s) {
                            return s.name;
                        });
                    else if(decl_obj.derivedFrom)
                        decl_obj.derivedFrom = [];
                    if (decl.annotations)
                        decl_obj.annotations = decl.annotations.map(function (a) {
                            return a.name;
                        });
                    else if(decl_obj.annotations)
                        decl_obj.annotations = [];
                }
            } else {
                decl_obj = {
                    name: decl.name,
                    version: {
                        type: "Version",
                        value: "0.0.1"
                    },
                    dialect: dialect,
                    body: decl.fetchBody(parser),
                    module: {
                        type: "Module",
                        value: {
                            dbId: this.moduleId
                        }
                    }
                };
                if (decl.getProto !== undefined)
                    decl_obj.prototype = decl.getProto();
                if (decl.storable !== undefined)
                    decl_obj.storable = decl.storable;
                if (decl.symbols)
                    decl_obj.symbols = decl.symbols.map(function (s) {
                        return s.name;
                    });
                if (decl.derivedFrom)
                    decl_obj.derivedFrom = decl.derivedFrom.map(function (s) {
                        return s.name;
                    });
                if (decl.annotations)
                    decl_obj.annotations = decl.annotations.map(function (a) {
                        return a.name;
                    });
                this.statuses[id] = {
                    editStatus: "CREATED",
                    resource: {
                        type: decl.getDeclarationType() + "Declaration",
                        value: decl_obj
                    }
                };
            }
        }, this);
    }


    markChangesCommitted(storedDecls) {
        storedDecls.forEach(storedDecl => {
            const id = this.idFromDbDecl(storedDecl);
            this.statuses[id].resource.value.dbId = storedDecl.value.dbId;
            this.statuses[id].editStatus = "CLEAN";
        }, this);
    }

    clearDeleted() {
        var deleted = [];
        for (var id in this.statuses) {
            if (this.statuses.hasOwnProperty(id) && this.statuses[id].editStatus === "DELETED")
                deleted.push(id);
        }
        deleted.forEach(id => {
            delete this.statuses[id];
        }, this);
    }


    getEditedDeclarations(contents) {
        return contents.map( content => {
            const id = this.idFromContent(content);
            const status = this.statuses[id];
            return {type: "EditedResource", value: status};
        }, this);
    }


    translate(data, from, to) {
        return translate(this.projectContext, data, from, to);
    }


    handleDestroyed(content) {
        const id = this.idFromContent(content);
        this.registerDestroyed(id);
        var obj_status = this.statuses[id];
        if (obj_status && obj_status.editStatus === "DELETED") {
            var decls = parse(obj_status.resource.value.body, obj_status.resource.value.dialect);
            decls[0].unregister(this.projectContext);
            var delta = new Delta();
            delta.removed = new Catalog(decls, this.librariesContext);
            delta.filterOutDuplicates();
            return delta;
        } else
            return null;
    }


    handleSetContent(content, dialect, listener) {
        try {
            return this.doHandleSetContent(content, dialect, listener);
        } catch (e) {
            return this.handleUnhandled(e, listener);
        }
    }


    doHandleSetContent(content, dialect, listener) {
        var decls = parse(content, dialect, listener);
        // don't pollute projectContext
        var child = this.projectContext.newChildContext();
        child.pushProblemListener(listener);
        try {
            decls.check(child);
        } finally {
            child.popProblemListener();
        }
        this.lastSuccess = decls; // assume registered content is always parsed successfully
    }


    handleEditContent(content, dialect, listener, selected) {
        try {
            return this.doHandleEditContent(content, dialect, listener, selected);
        } catch (e) {
            return this.handleUnhandled(e, listener);
        }
    }

    handleUnhandled(e, listener) {
        if (!listener.problems.length) {
            const problem = {
                startLine: 1,
                startColumn: 0,
                endLine: 1000,
                endColumn: 1000,
                type: "error",
                message: "Invalid syntax!"
            };
            listener.collectProblem(problem);
        }
        return null;
    }

    doHandleEditContent(content, dialect, listener, selected) {
        const startTime = profiling ? Date.now() : null;
        const old_decls = this.lastSuccess;
        const parser = newParser(content, dialect, listener);
        const new_decls = parser.parse();
        new_decls.forEach( decl => {
            decl.sourceCode = { dialect: dialect, body: decl.fetchBody(parser) };
        });
        const parseEndTime = profiling ? Date.now() : null;
        if(profiling)
            self.logDebug("parse time: " + (parseEndTime - startTime) + " ms");
        // look for duplicates
        this.checkDuplicates(old_decls, new_decls, listener);
        const duplicatesEndTime = profiling ? Date.now() : null;
        if(profiling)
            self.logDebug("check duplicates time: " + (duplicatesEndTime - parseEndTime) + " ms");
        // only update codebase if syntax is correct and there is no foreseeable damage
        if (listener.problems.length === 0) {
            this.lastSuccess = new_decls;
            const delta = this.updateCodebase(old_decls, new_decls, parser, dialect, listener);
            const updateEndTime = profiling ? Date.now() : null;
            if(profiling)
                self.logDebug("repo update time: " + (updateEndTime - duplicatesEndTime) + " ms");
            if(delta) {
                const $delta = delta.getContent();
                if (selected && new_decls.length === 1) // object might have been renamed
                    $delta.selected = new_decls[0].name;
                $delta.editedCount = new_decls.length;
                if(old_decls.length<=1 && new_decls.length===1)
                    $delta.newContent = delta.getFirstAdded();
                return $delta;
            } else
                return null;
        } else
            return null;
    }


    checkDuplicates(old_decls, new_decls, listener) {
        return new_decls.some(decl => {
            if(this.isDuplicate(decl, old_decls)) {
                listener.reportDuplicate(decl.name, decl);
                return true;
            } else
                return false;
        }, this);
    }


    isDuplicate(decl, old_decls) {
        // if updating an existing declaration, not a duplicate
        // TODO refine for method protos
        if(old_decls.some(old => old.name === decl.name))
            return false;
        const existing = this.projectContext.getRegisteredDeclaration(decl.id);
        if(existing instanceof prompto.runtime.MethodDeclarationMap) {
            if(decl instanceof prompto.declaration.BaseMethodDeclaration)
                return existing.hasProto(decl.getProto());
            else
                return true;
        }
        return !!existing;
    }

    updateCodebase(old_decls, new_decls, parser, dialect, listener) {
        var delta = new Delta();
        delta.removed = new Catalog(old_decls, this.projectContext, this.librariesContext);
        delta.added = new Catalog(new_decls, this.projectContext, this.librariesContext);
        var changedIdsCount = delta.filterOutDuplicates();
        var handled = this.updateRenamed(changedIdsCount, old_decls, new_decls, parser, dialect);
        this.updateAppContext(old_decls, new_decls, listener);
        if (!handled) {
            // either no change in ids, or more than one
            // simply mark new decls as dirty, don't destroy old ones, since this can
            // be achieved safely through an explicit action in the UI
            this.registerDirty(new_decls, parser, dialect);
        }
        if (changedIdsCount !== 0) {
            delta.adjustForMovingProtos(this.projectContext);
            return delta;
        } else
            return null; // no UI update required
    }

    updateRenamed(changedIdsCount, old_decls, new_decls, parser, dialect) {
        // special case when changing id of a declaration, try connect to the previous version
        if (changedIdsCount !== 2 || old_decls.length === 0 || new_decls.length !== old_decls.length)
            return false;
        // locate new declaration, for which there is no existing status entry
        var decls_with_status = new_decls.filter(decl => {
            var id = this.idFromDecl(decl);
            var status = this.statuses[id] || null;
            return status === null;
        }, this);
        if (decls_with_status.length === 1) {
            var new_decl = decls_with_status[0];
            var new_id = this.idFromDecl(new_decl);
            var new_status = this.statuses[new_id];
            // locate corresponding old declaration
            var orphan_decls = old_decls.filter(function (decl) {
                var id = this.idFromDecl(decl);
                return new_decls.filter(function (decl) {
                    return id === this.idFromDecl(decl);
                }, this).length === 0;
            }, this);
            if (orphan_decls.length === 1) {
                var old_decl = orphan_decls[0];
                var old_id = this.idFromDecl(old_decl);
                var old_status = this.statuses[old_id];
                // all ok, move the object
                if (old_status && !new_status) {
                    // update statuses
                    this.statuses[new_id] = this.statuses[old_id];
                    delete this.statuses[old_id];
                    // update status obj
                    new_status = old_status;
                    if (new_status.editStatus !== "CREATED") // don't overwrite
                        new_status.editStatus = "DIRTY";
                    // update declaration obj
                    new_status.resource.type = new_decl.getDeclarationType() + "Declaration";
                    var decl_obj = new_status.resource.value;
                    decl_obj.name = new_decl.name;
                    decl_obj.dialect = dialect;
                    decl_obj.body = new_decl.fetchBody(parser);
                    if (new_decl.getProto !== undefined)
                        decl_obj.prototype = new_decl.getProto();
                    if (new_decl.storable !== undefined)
                        decl_obj.storable = new_decl.storable;
                    return true;
                }
            }
        }
        // done
        return false;
    }

    updateAppContext(old_decls, new_decls, listener) {
        old_decls.unregister(this.projectContext); // TODO: manage damage on objects referring to these
        new_decls.unregister(this.projectContext); // avoid duplicate declaration errors
        var saved_listener = this.projectContext.problemListener;
        try {
            this.projectContext.problemListener = listener;
            new_decls.register(this.projectContext);
            new_decls.check(this.projectContext.newChildContext()); // don't pollute projectContext
        } finally {
            this.projectContext.problemListener = saved_listener;
        }
    }

    contentForStackFrame(stackFrame) {
        if (stackFrame.categoryName && stackFrame.categoryName.length)
            return this.categoryForStackFrame(stackFrame);
        else
            return this.methodForStackFrame(stackFrame);
    }

    categoryForStackFrame(stackFrame) {
        const decl = this.projectContext.getRegisteredDeclaration({ name: stackFrame.categoryName});
        if(decl)
            return { type: this.typeFromDeclaration(this.projectContext, decl), name: stackFrame.categoryName };
        else
            return null;
    }

    typeFromDeclaration(context, decl) {
        if(decl instanceof prompto.declaration.BaseMethodDeclaration)
            return "MethodRef";
        else if(decl instanceof prompto.declaration.AttributeDeclaration)
            return "AttributeRef";
        else if(decl instanceof prompto.declaration.CategoryDeclaration) {
            if(decl.isWidget(context))
                return "WidgetRef";
            else
                return "CategoryRef";
        } else if (decl instanceof prompto.declaration.EnumeratedCategoryDeclaration || decl instanceof prompto.declaration.EnumeratedNativeDeclaration)
            return "EnumerationRef";
        else if(decl instanceof prompto.declaration.TestMethodDeclaration)
            return "TestRef";
        else
            return null; // TODO log
    }


    methodForStackFrame(stackFrame) {
        let decl = this.projectContext.getRegisteredTest(stackFrame.methodName);
        if(!decl) {
            const methodsMap = this.projectContext.getRegisteredDeclaration({name: stackFrame.methodName});
            if(methodsMap)
                decl = stackFrame.methodProto ? methodsMap.protos[stackFrame.methodProto] : methodsMap.getFirst();
        }
        if(decl)
            return { type: this.typeFromDeclaration(this.projectContext, decl), name: stackFrame.methodName, prototype: stackFrame.methodProto || null };
        else
            return null;
    }


    createBreakpointAtLine(content, line, dialect) {
        if(content === null)
            return null;
        let creator = null;
        switch(content.type) {
            case "MethodRef":
                creator = this.createBreakpointAtMethodLine;
                break;
            case "TestRef":
                creator = this.createBreakpointAtTestLine;
                break;
            case "CategoryRef":
            case "WidgetRef":
                creator = this.createBreakpointAtCategoryLine;
                break;
        }
        if(creator === null)
            return null;
        let decl = this.getDeclaration(content);
        if(decl === null)
            return null;
        if(decl.sourceCode.dialect !== dialect) {
            const body = this.getDeclarationBody(decl, dialect);
            decl = parse(body, dialect)[0];
        }
        const brkpt = creator.bind(this)(decl, line);
        // for now always a line breakpoint (planning for constructor, monitor...)
        return brkpt ? { type: "LineBreakpoint", value: brkpt } : null;
    }

    createBreakpointAtMethodLine(decl, line) {
        const section = decl.locateSectionAtLine(line);
        if(section === null)
            return null;
        else
            return { methodName:  decl.name, methodProto: decl.getProto(this.projectContext), statementLine: section.startLocation.line };
    }

    createBreakpointAtTestLine(decl, line) {
        const section = decl.locateSectionAtLine(line);
        if(section === null)
            return null;
        else
            return { methodName:  decl.name, statementLine: section.startLocation.line };
    }

    createBreakpointAtCategoryLine(decl, line) {
        if(!decl.methods)
            return null;
        for(let i=0; i<decl.methods.length; i++ ) {
            const method = decl.methods[i];
            let brkpt = this.createBreakpointAtMethodLine(method, line);
            if(brkpt !== null) {
                return Object.assign({}, brkpt, {categoryName: decl.name, methodLine: method.startLocation.line} );
            }
        }
        return null;
    }

    locateSection(breakpoint) {
        let declaration = null;
        if (breakpoint.categoryName)
            declaration = this.projectContext.getRegisteredDeclaration({name: breakpoint.categoryName});
        else if (breakpoint.methodName) {
            if(breakpoint.methodName === '"')
                declaration = this.projectContext.getRegisteredTest(breakpoint.name);
            else {
                const methods = this.projectContext.getRegisteredDeclaration({name: breakpoint.methodName});
                if (methods)
                    declaration = methods.protos[breakpoint.methodProto];
            }
        }
        if(declaration==null)
            return null;
        const section = declaration.locateSectionAtLine(breakpoint.statementLine);
        if(section==null)
            return null;
        const result = section.serialize();
        if(!result.value.path)
            result.value.path = this.computeValuePath(breakpoint, declaration, section);
        return result
    }

    computeValuePath(breakpoint, declaration, section) {
        let typeName = "";
        let valueName = "";
        let protoName = "";
        if(declaration instanceof prompto.declaration.TestMethodDeclaration) {
            typeName = "test";
            valueName = declaration.name;
        } else if(declaration instanceof prompto.declaration.BaseMethodDeclaration) {
            if(declaration.memberOf) {
                typeName = "category";
                valueName = declaration.memberOf.name;
            } else {
                typeName = "method";
                valueName = declaration.name;
                protoName = "/" + breakpoint.methodProto;
            }
        }
        return "store:/" + typeName +"/" + valueName + protoName;
    }
}
