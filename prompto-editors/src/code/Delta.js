import { sortBy } from './CodeUtils';
import Catalog from './Catalog';

/**
 * An object which represents the delta between 2 catalogs
 * The purpose of this class is to minimize the re-processing in the IDE
 * when code is updated. Typically, various scenarios can occur:
 *  - code body change, this has not impact on the catalog
 *  - declaration removed
 *  - declaration added
 *  - declarations changed, which for global methods adds complexity because
 *  methods are displayed differently depending on their number of prototypes
 *  This follows the assumption that the number of overloads for a method name is generally very low (< 10).
 */


export default class Delta {

    constructor() {
        this.removed = null;
        this.added = null;
    }

    length() {
        var length = 0;
        if (this.removed)
            length += this.removed.length();
        if (this.added)
            length += this.added.length();
        return length;
    }

    getContent() {
        return {removed: this.removed, added: this.added};
    }

    getFirstAdded() {
        if(!this.added)
            return null;
        for(let key in this.added) {
            const list = this.added[key];
            if(list && list.length > 0) {
                const entry = list[0];
                if (key === "methods") {
                    return { ...{name: entry.name}, ...entry.protos[0] };
                } else
                    return entry;
            }
        }
        return null;
    }

    filterOutDuplicates() {
        if (!this.removed && !this.added)
            return 0;
        if (!this.removed)
            return this.added.length();
        if (!this.added)
            return this.removed.length();
        var length = this.filterOutDuplicatesInField("attributes");
        length += this.filterOutDuplicatesInField("methods");
        length += this.filterOutDuplicatesInField("categories");
        length += this.filterOutDuplicatesInField("enumerations");
        length += this.filterOutDuplicatesInField("tests");
        length += this.filterOutDuplicatesInField("widgets");
        return length;
    }

    filterOutDuplicatesInField(field) {
        var fn = this.filterOutDuplicatesInLists;
        if (field === "methods")
            fn = this.filterOutDuplicatesInMethods;
        else if (field === "enumerations")
            fn = (a, b) => this.filterOutDuplicatesInLists(a, b, "name");
        var length = fn.bind(this)(this.removed[field], this.added[field]);
        // clean up empty lists
        if (this.removed[field] && !this.removed[field].length)
            delete this.removed[field];
        if (this.added[field] && !this.added[field].length)
            delete this.added[field];
        return length;
    }

    filterOutDuplicatesInLists(a, b, field) {
        if (a && b) {
            if (field) {
                sortBy(a, field);
                sortBy(b, field);
            } else {
                a.sort();
                b.sort();
            }
            for (var i = 0, j = 0; i < a.length && j < b.length;) {
                var va = a[i];
                if (field)
                    va = va[field];
                var vb = b[j];
                if (field)
                    vb = vb[field];
                if (va === vb) {
                    a.splice(i, 1);
                    b.splice(j, 1);
                } else if (va > vb) {
                    j++;
                } else {
                    i++;
                }
            }
            return a.length + b.length;
        } else if (a)
            return a.length;
        else if (b)
            return b.length;
        else
            return 0;
    }

    filterOutDuplicatesInMethods(a, b) {
        if (a && b) {
            sortBy(a, "name");
            sortBy(b, "name");
            for (var i = 0, j = 0; i < a.length && j < b.length;) {
                if (a[i].name === b[j].name) {
                    this.filterOutDuplicatesInLists(a[i].protos, b[j].protos, "proto");
                    if (!a[i].protos || !a[i].protos.length)
                        a.splice(i, 1);
                    i++;
                    if (!b[j].protos || !b[j].protos.length)
                        b.splice(j, 1);
                    j++;
                } else if (a[i].name > b[j].name) {
                    j++;
                } else {
                    i++;
                }
            }
            return a.length + b.length;
        } else if (a)
            return a.length;
        else if (b)
            return b.length;
        else
            return 0;
    }

    adjustForMovingProtos(context) {
        // methods with 1 proto are displayed differently than methods with multiple protos
        // if proto cardinality changes from N to 1 or 1 to N, we need to rebuild the corresponding displays
        if (this.removed && this.removed.methods) {
            this.removed.methods.forEach(method => {
                var decl = context.getRegisteredDeclaration(method.name);
                if (decl && Object.keys(decl.protos).length === 1 && !this.isModifiedProto(method)) // moved from N to 1
                    this.adjustMethodForRemovedProtos(method, decl);
            }, this);
        }
        if (this.added && this.added.methods) {
            this.added.methods.forEach(method => {
                var decl = context.getRegisteredDeclaration(method.name);
                if (decl && Object.keys(decl.protos).length - method.protos.length === 1) // moved from 1 to N
                    this.adjustMethodForAddedProtos(method, decl);
            }, this);
        }
        // cleanup
        if (this.removed && this.removed.methods) {
            this.removed.methods.forEach(method => {
                if (method.proto_to_remove) {
                    method.protos.push(method.proto_to_remove);
                    sortBy(method.protos, "proto");
                    delete method.proto_to_remove;
                }
            });
        }
        if (this.added && this.added.methods) {
            this.added.methods.forEach(method => {
                if (method.proto_to_add) {
                    method.protos.push(method.proto_to_add);
                    sortBy(method.protos, "proto");
                    delete method.proto_to_add;
                }
            });
        }
    }


    isModifiedProto(method) {
        if (!this.added || !this.added.methods)
            return false;
        var added = this.added.methods.filter(m => m.name === method.name);
        if (added.length === 0)
            return false;
        return true;
    }

    adjustMethodForAddedProtos(method, decl) {
        var proto = this.findPreExistingProto(method, decl);
        if (proto) {
            var proto_to_move = {proto: proto, main: decl.protos[proto].isEligibleAsMain()};
            // add it to the remove list
            if (!this.removed)
                this.removed = new Catalog();
            var removed = this.findOrCreateMethod(this.removed, method.name);
            removed.proto_to_remove = proto_to_move;
            // add it to the add list
            method.proto_to_add = proto_to_move;
        }
    }


    findPreExistingProto(method, decl) {
        for (var proto in decl.protos) {
            if (decl.protos.hasOwnProperty(proto)) {
                var found = false;
                for (var i = 0; !found && i < method.protos.length; i++) {
                    found = proto === method.protos[i].proto;
                }
                if (!found)
                    return proto;
            }
        }
        return null; // TODO throw error?
    }

    adjustMethodForRemovedProtos(method, decl) {
        // the below will only loop once
        for (var proto in decl.protos) {
            if (decl.protos.hasOwnProperty(proto)) {
                this.adjustMethodForRemovedProto(method, decl, proto);
            }
        }
    }

    adjustMethodForRemovedProto(method, decl, proto) {
        var proto_to_move = {proto: proto, main: decl.protos[proto].isEligibleAsMain()};
        // add it to the remove list
        method.proto_to_remove = proto_to_move;
        // add it to the added list
        if (!this.added)
            this.added = new Catalog();
        var added = this.findOrCreateMethod(this.added, decl.name);
        // avoid adding it twice (it might have just been added)
        added.protos.forEach(current => {
            if (proto_to_move && proto_to_move.proto === current.proto)
                proto_to_move = null; // don't add it
        });
        // not an existing proto ?
        if (proto_to_move)
            added.proto_to_add = proto_to_move;
    }

    findOrCreateMethod (catalog, name) {
        if (!catalog.methods)
            catalog.methods = [];
        for (var i = 0; i < catalog.methods.length; i++) {
            if (catalog.methods[i].name === name)
                return catalog.methods[i];
        }
        var created = {name: name, protos: []};
        catalog.methods.push(created);
        return created;
    }
}