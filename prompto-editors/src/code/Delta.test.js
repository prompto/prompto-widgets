import Delta from './Delta';
import Codebase from './Codebase';

beforeAll(()=>{
    jest.requireActual("../../../../../../../prompto-javascript/JavaScript-Core/src/main");
    const globals = global || window || self || this;
    globals.antlr4 = antlr4;
    globals.prompto = prompto;
});


it('filterOutDuplicates preserves added single proto', () => {
    var delta = new Delta();
    delta.removed = new Codebase();
    delta.added = new Codebase();
    delta.added.methods = [{
        name: "test", protos: [{proto: "simple", main: true}]
    }];
    var count = delta.filterOutDuplicates();
    expect(count).toEqual(1);
});


it('filterOutDuplicates preserves removed single proto', () => {
    var delta = new Delta();
    delta.removed = new Codebase();
    delta.removed.methods = [{
        name: "test", protos: [{proto: "simple", main: true}]
    }];
    delta.added = new Codebase();
    var count = delta.filterOutDuplicates();
    expect(count).toEqual(1);
});

it('filterOutDuplicates ignores unchanged single proto', () => {
    var delta = new Delta();
    delta.removed = new Codebase();
    delta.removed.methods = [{
        name: "test", protos: [
            {proto: "simple", main: true}
        ]
    }];
    delta.added = new Codebase();
    delta.added.methods = [{
        name: "test", protos: [
            {proto: "simple", main: true}
        ]
    }];
    var count = delta.filterOutDuplicates();
    expect(count).toEqual(0);
});


it('filterOutDuplicates adds and removes distinct protos', () => {
    var delta = new Delta();
    delta.removed = new Codebase();
    delta.removed.methods = [{
        name: "test", protos: [
            {proto: "simple1", main: true}
        ]
    }];
    delta.added = new Codebase();
    delta.added.methods = [{
        name: "test", protos: [
            {proto: "simple2", main: true}
        ]
    }];
    var count = delta.filterOutDuplicates();
    expect(count).toEqual(2);
});


it('filterOutDuplicates adds proto when adding and removing other proto', () => {
    var delta = new Delta();
    delta.removed = new Codebase();
    delta.removed.methods = [{
        name: "test", protos: [
            {proto: "simple2", main: true}
        ]
    }];
    delta.added = new Codebase();
    delta.added.methods = [{
        name: "test", protos: [
            {proto: "simple1", main: true},
            {proto: "simple2", main: true}
        ]
    }];
    var count = delta.filterOutDuplicates();
    expect(count).toEqual(1);
});


it('filterOutDuplicates removes proto when adding and removing other proto', () => {
    var delta = new Delta();
    delta.removed = new Codebase();
    delta.removed.methods = [{
        name: "test", protos: [
            {proto: "simple1", main: true},
            {proto: "simple2", main: true}
        ]
    }];
    delta.added = new Codebase();
    delta.added.methods = [{
        name: "test", protos: [
            {proto: "simple2", main: true}
        ]
    }];
    var count = delta.filterOutDuplicates();
    expect(count).toEqual(1);
});

function createContextWithMethods(methods) {
    var context = prompto.runtime.Context.newGlobalsContext();
    methods.map(function (method) {
        var params = new prompto.param.ParameterList();
        method.parameters.map(function (name) {
            var id = new prompto.grammar.Identifier(name);
            var param = new prompto.param.AttributeParameter(id);
            params.push(param);
        });
        var id = new prompto.grammar.Identifier(method.name);
        var decl = new prompto.declaration.ConcreteMethodDeclaration(id, params);
        decl.register(context);
    });
    return context;
}


it('adjustForMovingProtos preserves added proto', () => {
    var context = createContextWithMethods([{name: "test", parameters: ["simple"]}]);
    var delta = new Delta();
    delta.removed = new Codebase();
    delta.added = new Codebase();
    delta.added.methods = [{
        name: "test", protos: [
            {proto: "(simple)", main: true}
        ]
    }];
    var count = delta.filterOutDuplicates();
    expect(count).toEqual(1);
    delta.adjustForMovingProtos(context);
    count = delta.length()
    expect(count).toEqual(1);
});

it('adjustForMovingProtos preserves removed proto', () => {
    var context = createContextWithMethods([]);
    var delta = new Delta();
    delta.removed = new Codebase();
    delta.removed.methods = [{
        name: "test", protos: [
            {proto: "(simple)", main: true}
        ]
    }];
    delta.added = new Codebase();
    var count = delta.filterOutDuplicates();
    expect(count).toEqual(1);
    delta.adjustForMovingProtos(context);
    count = delta.length()
    expect(count).toEqual(1);
});


it('adjustForMovingProtos preserves added and removed protos', () => {
    var context = createContextWithMethods([{name: "test", parameters: ["(simple2)"]}]);
    var delta = new Delta();
    delta.removed = new Codebase();
    delta.removed.methods = [{
        name: "test", protos: [
            {proto: "(simple1)", main: true}
        ]
    }];
    delta.added = new Codebase();
    delta.added.methods = [{
        name: "test", protos: [
            {proto: "(simple2)", main: true}
        ]
    }];
    var count = delta.filterOutDuplicates();
    expect(count).toEqual(2);
    delta.adjustForMovingProtos(context);
    count = delta.length()
    expect(count).toEqual(2);
});

it('adjustForMovingProtos preserves existing protos when moving protos', () => {
    var context = createContextWithMethods([{name: "test", parameters: ["(simple1)"]},
        {name: "test", parameters: ["(simple2)"]}]);
    var delta = new Delta();
    delta.added = new Codebase();
    delta.added.methods = [{
        name: "test", protos: [
            {proto: "(simple2)", main: true}
        ]
    }];
    var count = delta.filterOutDuplicates();
    expect(count).toEqual(1);
    delta.adjustForMovingProtos(context);
    count = delta.length()
    expect(count).toEqual(2);
    expect(delta.removed.methods.length).toEqual(1);
    var method = delta.removed.methods[0];
    expect(method.name).toEqual("test");
    expect(method.protos[0].proto).toEqual("(simple1)");
    expect(delta.added.methods.length).toEqual(1);
    method = delta.added.methods[0];
    expect(method.protos[0].proto).toEqual("(simple1)");
    expect(method.protos[1].proto).toEqual("(simple2)");
});

it('adjustForMovingProtos preserves existing protos when removing proto', () => {
    var context = createContextWithMethods([{name: "test", parameters: ["(simple2)"]}]);
    var delta = new Delta();
    delta.removed = new Codebase();
    delta.removed.methods = [{
        name: "test", protos: [
            {proto: "(simple1)", main: true}
        ]
    }];
    var count = delta.filterOutDuplicates();
    expect(count).toEqual(1);
    delta.adjustForMovingProtos(context);
    expect(delta.length()).toEqual(2);
    expect(delta.removed.methods.length).toEqual(1);
    var method = delta.removed.methods[0];
    expect(method.name).toEqual("test");
    expect(method.protos[0].proto).toEqual("(simple1)");
    expect(method.protos[1].proto).toEqual("(simple2)");
    expect(delta.added.methods.length).toEqual(1);
    method = delta.added.methods[0];
    expect(method.protos[0].proto).toEqual( "(simple2)");
});
