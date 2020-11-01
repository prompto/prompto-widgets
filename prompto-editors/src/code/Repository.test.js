import path from 'path';
import fs from 'fs';
import Delta from './Delta';
import Codebase from './Codebase';
import Repository from './Repository';

beforeAll(()=>{
    jest.requireActual("../../../../../../../prompto-javascript/JavaScript-Core/src/main");
    const globals = global || window || self || this;
    globals.antlr4 = antlr4;
    globals.prompto = prompto;
});


function fixPath(filePath) {
    return path.normalize(path.dirname(path.dirname(module.filename)) + "/" + filePath);
}

function loadText(filePath) {
    return fs.readFileSync(fixPath(filePath), {encoding: 'utf8'});
}

function clearws(text) {
    return text.replace(/(\n|\r|\t)+/g, "");
}

test.skip('code is loaded', () => {
    global.Event = function () {}; // referred by web stuff
    var code = loadText("../../../src/web/public/prompto/prompto.pec");
    var repo = new Repository();
    repo.registerLibraryCode(code, "E");
    expect(repo.librariesContext).not.toBeNull();
    expect(Object.keys(repo.librariesContext.declarations).length > 0).toBeTruthy();
});

it('sets status of new attribute to CREATED', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define name as Text attribute", "E", listener);
    expect(delta.added.attributes[0]).toEqual("name");
    expect(repo.statuses["name"].editStatus).toEqual("CREATED");
});

it('sets status of new attributes to CREATED', () => {
    var repo = new Repository();
    var inputs = [
        "defin",
        "define na",
        "define name as Te",
        "define name as Text attri",
        "define name as Text attribute",
        "define name as Text attribute\ndefine name as Text attribute",
        "define name as Text attribute\ndefine cou as Text attribute",
        "define name as Text attribute\ndefine count as Text attribute",
        "define names as Text attribute\ndefine count as Text attribute",
        "define names as Text attribute\ndefine count as Text attribute\ndefine count as Text attribute",
        "define names as Text attribute\ndefine count as Text attribute\ndefine xcount as Text attribute",
        "define names as Text attribute\ndefine count as Text attribute\ndefine xcounts as Text attribute"
    ];
    inputs.map(function(input) {
        repo.handleEditContent(input, "E", new prompto.problem.ProblemCollector());
    });
    var names = Object.getOwnPropertyNames(repo.statuses);
    expect(names.length).toEqual(3);
    expect(repo.statuses["count"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["xcounts"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["names"].editStatus).toEqual( "CREATED");
});

it('preserves CREATED status of new attribute when updating it', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define name as Integer attribute", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["name"].editStatus).toEqual("CREATED");
    expect(clearws(repo.statuses["name"].stuff.value.body)).toEqual(clearws("define name as Integer attribute"));
});

it('preserves dbId and sets DIRTY status when updating existing attribute', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Integer attribute", "E", listener);
    repo.statuses["name"].editStatus = "CLEAN";
    repo.statuses["name"].stuff.value.dbId = "Some UUID";
    var delta = repo.handleEditContent("define name as Text attribute", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["name"].editStatus).toEqual("DIRTY");
    expect(repo.statuses["name"].stuff.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["name"].stuff.value.body)).toEqual(clearws("define name as Text attribute"));
});

it('preserves dbId and sets DIRTY status when changing dialect', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    repo.statuses["name"].editStatus = "CLEAN";
    repo.statuses["name"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("attribute name: Text;", "O", listener);
    expect(repo.statuses["name"].editStatus).toEqual("DIRTY");
    expect(repo.statuses["name"].stuff.value.dbId).toEqual("Some UUID");
    expect(repo.statuses["name"].stuff.value.dialect).toEqual("O");
    expect(repo.statuses["name"].stuff.value.body).toEqual("attribute name: Text;");
});

it('preserves CREATED status after selecting and updating', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define name as Text attribute", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define name as Integer attribute", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["name"].editStatus).toEqual("CREATED");
    expect(repo.statuses["name"].stuff.value.body).toEqual("define name as Integer attribute");
});

it('preserves CREATED status when renaming new attribute', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define renamed as Text attribute", "E", listener);
    expect(delta.removed.attributes[0]).toEqual("name");
    expect(delta.added.attributes[0]).toEqual("renamed");
    expect(repo.statuses["name"]).toBeUndefined();
    expect(repo.statuses["renamed"].editStatus).toEqual("CREATED");
});


it('preserves CREATED status when renaming DIRTY attribute', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    repo.statuses["name"].editStatus = "CLEAN";
    repo.statuses["name"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define renamed as Text attribute", "E", listener);
    expect(delta.removed.attributes[0]).toEqual("name");
    expect(delta.added.attributes[0]).toEqual("renamed");
    expect(repo.statuses["name"]).toBeUndefined();
    expect(repo.statuses["renamed"].stuff.value.dbId).toEqual("Some UUID");
    expect(repo.statuses["renamed"].editStatus).toEqual("DIRTY");
});


it('preserves dbId and DIRTY status when renaming DIRTY attribute', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    repo.statuses["name"].editStatus = "CLEAN";
    repo.statuses["name"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleSetContent("define name as Text attribute", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define renamed as Text attribute", "E", listener);
    expect(delta.removed.attributes[0]).toEqual("name");
    expect(delta.added.attributes[0]).toEqual("renamed");
    expect(repo.statuses["name"]).toBeUndefined();
    expect(repo.statuses["renamed"].stuff.value.dbId).toEqual("Some UUID");
    expect(repo.statuses["renamed"].editStatus).toEqual("DIRTY");
});


it('sets status to DELETED when destroying new attribute', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    expect(repo.statuses["name"].editStatus).toEqual("CREATED");
    var delta = repo.handleDestroyed({subType: "attribute", name: "name"});
    expect(delta.removed.attributes[0]).toEqual("name");
    expect(repo.statuses["name"].editStatus).toEqual("DELETED");
});

it('sets status to DELETED when destroying existing attribute', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    repo.statuses["name"].editStatus = "CLEAN";
    repo.statuses["name"].stuff.value.dbId = "Some UUID";
    var delta = repo.handleDestroyed({subType: "attribute", name: "name"});
    expect(delta.removed.attributes[0]).toEqual("name");
    expect(repo.statuses["name"].stuff.value.dbId).toEqual("Some UUID");
    expect(repo.statuses["name"].editStatus).toEqual("DELETED");
});


it('sets status to DELETED when selecting then destroying new attribute', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define name as Text attribute", "E", listener);
    var delta = repo.handleDestroyed({subType: "attribute", name: "name"});
    expect(delta.removed.attributes[0]).toEqual("name");
    expect(repo.statuses["name"].editStatus).toEqual("DELETED");
});

it('sets status to DELETED when selecting then destroying existing attribute', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    repo.statuses["name"].editStatus = "CLEAN";
    repo.statuses["name"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define name as Text attribute", "E", listener);
    var delta = repo.handleDestroyed({subType: "attribute", name: "name"});
    expect(delta.removed.attributes[0]).toEqual("name");
    expect(repo.statuses["name"].stuff.value.dbId).toEqual("Some UUID");
    expect(repo.statuses["name"].editStatus).toEqual("DELETED");
});

it('sets status of new category to CREATED', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    expect(delta.added.categories[0]).toEqual("Xyz");
    expect(repo.statuses["Xyz"].editStatus).toEqual("CREATED");
});


it('preserves status of new category to CREATED when updating', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define Xyz as category with attribute other", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["Xyz"].editStatus).toEqual("CREATED");
    expect(clearws(repo.statuses["Xyz"].stuff.value.body)).toEqual("define Xyz as category with attribute other");
});

it('preserves dbId and sets status to DIRTY when updating existing category', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    repo.statuses["Xyz"].editStatus = "CLEAN";
    repo.statuses["Xyz"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define Xyz as category with attribute other", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["Xyz"].editStatus).toEqual("DIRTY");
    expect(repo.statuses["Xyz"].stuff.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["Xyz"].stuff.value.body)).toEqual("define Xyz as category with attribute other");
});

it('preserves CREATED status when selecting then updating category', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define Xyz as category with attribute other", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["Xyz"].editStatus).toEqual("CREATED");
    expect(clearws(repo.statuses["Xyz"].stuff.value.body)).toEqual("define Xyz as category with attribute other");
});

it('preserves dbId and sets status to DIRTY when selecting then updating existing category', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    repo.statuses["Xyz"].editStatus = "CLEAN";
    repo.statuses["Xyz"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define Xyz as category with attribute other", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["Xyz"].editStatus).toEqual("DIRTY");
    expect(repo.statuses["Xyz"].stuff.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["Xyz"].stuff.value.body)).toEqual("define Xyz as category with attribute other");
});

it('preserves CREATED status when renaming new category', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define Abc as category with attribute name", "E", listener);
    expect(delta.removed.categories[0]).toEqual("Xyz");
    expect(delta.added.categories[0]).toEqual("Abc");
    expect(repo.statuses["Xyz"]).toBeUndefined();
    expect(repo.statuses["Abc"].editStatus).toEqual("CREATED");
});

it('preserves dbId and sets status to DIRTY when renaming existing category', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    repo.statuses["Xyz"].editStatus = "CLEAN";
    repo.statuses["Xyz"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define Abc as category with attribute other", "E", listener);
    expect(delta.removed.categories[0]).toEqual("Xyz");
    expect(delta.added.categories[0]).toEqual("Abc");
    expect(repo.statuses["Xyz"]).toBeUndefined();
    expect(repo.statuses["Abc"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["Abc"].stuff.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["Abc"].stuff.value.body)).toEqual("define Abc as category with attribute other");
});

it('preserves CREATED status when selecting then renaming new category', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define Abc as category with attribute name", "E", listener);
    expect(delta.removed.categories[0]).toEqual("Xyz");
    expect(delta.added.categories[0]).toEqual("Abc");
    expect(repo.statuses["Xyz"]).toBeUndefined();
    expect(repo.statuses["Abc"].editStatus).toEqual( "CREATED");
});

it('preserves dbId and sets status to DIRTY when selecting then renaming existing category', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    repo.statuses["Xyz"].editStatus = "CLEAN";
    repo.statuses["Xyz"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define Abc as category with attribute other", "E", listener);
    expect(delta.removed.categories[0]).toEqual("Xyz");
    expect(delta.added.categories[0]).toEqual("Abc");
    expect(repo.statuses["Xyz"]).toBeUndefined();
    expect(repo.statuses["Abc"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["Abc"].stuff.value.dbId).toEqual("Some UUID");
    expect(repo.statuses["Abc"].stuff.value.body).toEqual("define Abc as category with attribute other");
});

it('sets status to DELETED when destroying new category', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    expect(repo.statuses["Xyz"].editStatus).toEqual( "CREATED");
    var delta = repo.handleDestroyed({subType: "category", name: "Xyz"});
    expect(delta.removed.categories[0]).toEqual("Xyz");
    expect(repo.statuses["Xyz"].editStatus).toEqual( "DELETED");
});


it('preserves dbId and sets status to DELETED when destroying existing category', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    repo.statuses["Xyz"].editStatus = "CLEAN";
    repo.statuses["Xyz"].stuff.value.dbId = "Some UUID";
    var delta = repo.handleDestroyed({subType: "category", name: "Xyz"});
    expect(delta.removed.categories[0]).toEqual("Xyz");
    expect(repo.statuses["Xyz"].stuff.value.dbId).toEqual("Some UUID");
    expect(repo.statuses["Xyz"].editStatus).toEqual( "DELETED");
});

it('sets status to DELETED when selecting then destroying new category', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define Xyz as category with attribute name", "E", listener);
    repo.registerDestroyed({category: "Xyz"});
    var delta = repo.handleDestroyed({subType: "category", name: "Xyz"});
    expect(delta.removed.categories[0]).toEqual("Xyz");
    expect(repo.statuses["Xyz"].editStatus).toEqual( "DELETED");
});

it('preserves dbId and sets status to DELETED when selecting then destroying existing category', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    repo.statuses["Xyz"].editStatus = "CLEAN";
    repo.statuses["Xyz"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define Xyz as category with attribute name", "E", listener);
    var delta = repo.handleDestroyed({subType: "category", name: "Xyz"});
    expect(delta.removed.categories[0]).toEqual("Xyz");
    expect(repo.statuses["Xyz"].stuff.value.dbId).toEqual("Some UUID");
    expect(repo.statuses["Xyz"].editStatus).toEqual( "DELETED");
});


it('sets status of new test to CREATED', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent('define "simple test" as test method doing:\n\ta = 3\nand verifying:\n\ta = 2', "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses['"simple test"'].editStatus).toEqual( "CREATED");
    expect(clearws(repo.statuses['"simple test"'].stuff.value.body)).toEqual(clearws('define "simple test" as test method doing:\n\ta = 3\nand verifying:\n\ta = 2\n'));
});


it('preserves CREATED status when selecting then updating new test', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent('define "simple test" as test method doing:\n\ta = 3\nand verifying:\n\ta = 2', "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses['"simple test"'].editStatus).toEqual( "CREATED");
    expect(clearws(repo.statuses['"simple test"'].stuff.value.body)).toEqual(clearws('define "simple test" as test method doing:\n\ta = 3\nand verifying:\n\ta = 2\n'));
});

it('preserves dbId and sets status to DIRTY when selecting then updating existing test', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    repo.statuses['"simple test"'].editStatus = "CLEAN";
    repo.statuses['"simple test"'].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent('define "simple test" as test method doing:\n\ta = 3\nand verifying:\n\ta = 2', "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses['"simple test"'].editStatus).toEqual("DIRTY");
    expect(repo.statuses['"simple test"'].stuff.value.dbId).toEqual('Some UUID');
    expect(clearws(repo.statuses['"simple test"'].stuff.value.body)).toEqual(clearws('define "simple test" as test method doing:\n\ta = 3\nand verifying:\n\ta = 2\n'));
});

it('preserves CREATED status when renaming new test', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent('define "renamed test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    expect(delta.removed.tests[0]).toEqual('"simple test"');
    expect(delta.added.tests[0]).toEqual('"renamed test"');
    expect(repo.statuses['"simple test"']).toBeUndefined();
    expect(repo.statuses['"renamed test"'].editStatus).toEqual( "CREATED");
});

it('preserves dbId and sets status to DIRTY when renaming existing test', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    repo.statuses['"simple test"'].editStatus = "CLEAN";
    repo.statuses['"simple test"'].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent('define "renamed test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    expect(delta.removed.tests[0]).toEqual('"simple test"');
    expect(delta.added.tests[0]).toEqual('"renamed test"');
    expect(repo.statuses['"simple test"']).toBeUndefined();
    expect(repo.statuses['"renamed test"'].editStatus).toEqual( "DIRTY");
    expect(repo.statuses['"renamed test"'].stuff.value.dbId).toEqual('Some UUID');
});


it('preserves CREATED status when selecting then renaming new test', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent('define "renamed test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    expect(delta.removed.tests[0]).toEqual('"simple test"');
    expect(delta.added.tests[0]).toEqual('"renamed test"');
    expect(repo.statuses['"simple test"']).toBeUndefined();
    expect(repo.statuses['"renamed test"'].editStatus).toEqual( "CREATED");
});


it('preserves dbId and sets status to DIRTY when selecting then renaming existing test', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    repo.statuses['"simple test"'].editStatus = "CLEAN";
    repo.statuses['"simple test"'].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent('define "renamed test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    expect(delta.removed.tests[0]).toEqual('"simple test"');
    expect(delta.added.tests[0]).toEqual('"renamed test"');
    expect(repo.statuses['"simple test"']).toBeUndefined();
    expect(repo.statuses['"renamed test"'].editStatus).toEqual( "DIRTY");
    expect(repo.statuses['"renamed test"'].stuff.value.dbId).toEqual('Some UUID');
});


it('sets status to DELETED when destroying new test', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    expect(repo.statuses['"simple test"'].editStatus).toEqual( "CREATED");
    var delta = repo.handleDestroyed({type: "test", name: '"simple test"'});
    expect(delta.removed.tests[0]).toEqual('"simple test"');
    expect(repo.statuses['"simple test"'].editStatus).toEqual( "DELETED");
});

it('sets status to DELETED when destroying existing test', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    repo.statuses['"simple test"'].editStatus = "CLEAN";
    repo.statuses['"simple test"'].stuff.value.dbId = "Some UUID";
    var delta = repo.handleDestroyed({type: "test", name: '"simple test"'});
    expect(delta.removed.tests[0]).toEqual('"simple test"');
    expect(repo.statuses['"simple test"'].editStatus).toEqual( "DELETED");
    expect(repo.statuses['"simple test"'].stuff.value.dbId).toEqual('Some UUID');
});

it('sets status to DELETED when selecting then destroying new test', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    var delta = repo.handleDestroyed({type: "test", name: '"simple test"'});
    expect(delta.removed.tests[0]).toEqual('"simple test"');
    expect(repo.statuses['"simple test"'].editStatus).toEqual( "DELETED");
});


it('sets status to DELETED when selecting then destroying existing test', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    repo.statuses['"simple test"'].editStatus = "CLEAN";
    repo.statuses['"simple test"'].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    var delta = repo.handleDestroyed({type: "test", name: '"simple test"'});
    expect(delta.removed.tests[0]).toEqual('"simple test"');
    expect(repo.statuses['"simple test"'].editStatus).toEqual( "DELETED");
    expect(repo.statuses['"simple test"'].stuff.value.dbId).toEqual('Some UUID');
});

it('sets status of new method to CREATED', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/"].editStatus).toEqual( "CREATED");
});

it('preserves CREATED status when updating new method', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define main as method doing:\n\ta = 3\n", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["main/"].editStatus).toEqual( "CREATED");
    expect(clearws(repo.statuses["main/"].stuff.value.body)).toEqual(clearws("define main as method doing:\n\ta = 3\n"));
});


it('preserves dbId and sets status to DIRTY when updating existing method', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define main as method doing:\n\ta = 3\n", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["main/"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["main/"].stuff.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/"].stuff.value.body)).toEqual(clearws("define main as method doing:\n\ta = 3\n"));
});

it('preserves CREATED status when selecting then updating new method', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define main as method doing:\n\ta = 3\n", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["main/"].editStatus).toEqual( "CREATED");
    expect(clearws(repo.statuses["main/"].stuff.value.body)).toEqual(clearws("define main as method doing:\n\ta = 3\n"));
});


it('preserves dbId and sets status to DIRTY when selecting then updating existing method', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define main as method doing:\n\ta = 3\n", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["main/"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["main/"].stuff.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/"].stuff.value.body)).toEqual(clearws("define main as method doing:\n\ta = 3\n"));
});

it('preserves CREATED status when renaming new method', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define renamed as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].name).toEqual("renamed");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["renamed/"].editStatus).toEqual( "CREATED");
});

it('preserves dbId and sets status to DIRTY when renaming existing method', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define renamed as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].name).toEqual("renamed");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["renamed/"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["renamed/"].stuff.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["renamed/"].stuff.value.body)).toEqual(clearws("define renamed as method doing:\n\ta = 2\n"));
});

it('preserves CREATED status when renaming new method with 1 proto', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define renamed as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].name).toEqual("renamed");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["renamed/"].editStatus).toEqual( "CREATED");
});

it('preserves dbId and sets status to DIRTY when renaming existing method with 1 proto', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define renamed as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].name).toEqual("renamed");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["renamed/"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["renamed/"].stuff.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["renamed/"].stuff.value.body)).toEqual(clearws("define renamed as method doing:\n\ta = 2\n"));
});

it('preserves CREATED status when updating proto of new method with 1 proto', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual("Text");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
});

it('preserves dbId and sets status to DIRTY when updating proto of existing method with 1 proto', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual("Text");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["main/Text"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["main/Text"].stuff.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/Text"].stuff.value.body)).toEqual(clearws("define main as method receiving Text value doing:\n\ta = 2\n"));
});

it('preserves CREATED status when selecting then updating proto of new method with 1 proto', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual("Text");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
});


it('preserves dbId and sets status to DIRTY when selecting then updating proto of existing method with 1 proto', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual("Text");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["main/Text"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["main/Text"].stuff.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/Text"].stuff.value.body)).toEqual(clearws("define main as method receiving Text value doing:\n\ta = 2\n"));
});

it('preserves dbId and sets status to DIRTY when selecting then updating proto of existing abstract method with 1 proto', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define text as Text attribute\ndefine main as abstract method receiving Text value\n", "E", listener);
    repo.statuses["main/Text"].editStatus = "CLEAN";
    repo.statuses["main/Text"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as abstract method receiving Text value\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define main as abstract method receiving text\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos.length).toEqual(1);
    expect(delta.removed.methods[0].protos[0].proto).toEqual("Text");
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos.length).toEqual(1);
    expect(delta.added.methods[0].protos[0].proto).toEqual("text");
    expect(repo.statuses["main/Text"]).toBeUndefined();
    expect(repo.statuses["main/text"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["main/text"].stuff.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/text"].stuff.value.body)).toEqual(clearws("define main as abstract method receiving text\n"));
});

it('preserves CREATED status when renaming new method with 2 protos', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define renamed as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("renamed");
    expect(delta.added.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["renamed/"].editStatus).toEqual( "CREATED");
});


it('preserves dbId and sets status to DIRTY when renaming existing method with 2 protos', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define renamed as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("renamed");
    expect(delta.added.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["renamed/"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["renamed/"].stuff.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["renamed/"].stuff.value.body)).toEqual(clearws("define renamed as method doing:\n\ta = 2\n"));
});

it('preserves CREATED status when selecting then renaming new method with 2 protos', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define renamed as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("renamed");
    expect(delta.added.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["renamed/"].editStatus).toEqual( "CREATED");
});


it('preserves dbId and sets status to DIRTY when selecting then renaming existing method with 2 protos', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define renamed as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("renamed");
    expect(delta.added.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["renamed/"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["renamed/"].stuff.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["renamed/"].stuff.value.body)).toEqual(clearws("define renamed as method doing:\n\ta = 2\n"));
});

it('preserves CREATED status when updating proto of new method with 2 protos', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define main as method receiving Integer value doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual("Integer");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/Integer"].editStatus).toEqual( "CREATED");
});


it('preserves dbId and sets status to DIRTY when updating proto of existing method with 2 protos', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define main as method receiving Integer value doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual("Integer");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/Integer"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["main/Integer"].stuff.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/Integer"].stuff.value.body)).toEqual(clearws("define main as method receiving Integer value doing:\n\ta = 2"));
});


it('preserves CREATED status when selecting then updating proto of new method with 2 protos', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define main as method receiving Integer value doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual("Integer");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/Integer"].editStatus).toEqual( "CREATED");
});


it('preserves dbId and sets status to DIRTY when selecting then updating proto of existing method with 2 protos', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    var delta = repo.handleEditContent("define main as method receiving Integer value doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual("Integer");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/Integer"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["main/Integer"].stuff.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/Integer"].stuff.value.body)).toEqual(clearws("define main as method receiving Integer value doing:\n\ta = 2\n"));
});

it('sets status to DELETED when destroying new method with 1 proto', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    expect(repo.statuses["main/"].editStatus).toEqual( "CREATED");
    var delta = repo.handleDestroyed({subType: "method", name: "main", proto: ""});
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/"].editStatus).toEqual( "DELETED");
});

it('preserves dbId and sets status to DELETED when destroying existing method with 1 proto', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].stuff.value.dbId = "Some UUID";
    var delta = repo.handleDestroyed({subType: "method", name: "main", proto: ""});
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/"].editStatus).toEqual( "DELETED");
    expect(repo.statuses["main/"].stuff.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/"].stuff.value.body)).toEqual(clearws("define main as method doing:\n\ta = 2\n"));
});

it('sets status to DELETED when selecting then destroying new method with 1 proto', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    expect(repo.statuses["main/"].editStatus).toEqual( "CREATED");
    var delta = repo.handleDestroyed({subType: "method", name: "main", proto: ""});
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/"].editStatus).toEqual( "DELETED");
});

it('preserves dbId and sets status to DELETED when selecting then destroying existing method with 1 proto', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].stuff.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    var delta = repo.handleDestroyed({subType: "method", name: "main", proto: ""});
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/"].editStatus).toEqual( "DELETED");
    expect(repo.statuses["main/"].stuff.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/"].stuff.value.body)).toEqual(clearws("define main as method doing:\n\ta = 2\n"));
});

it('sets status to DELETED when destroying new method with 2 protos', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    expect(repo.statuses["main/"].editStatus).toEqual( "CREATED");
    var delta = repo.handleDestroyed({subType: "method", name: "main", proto: ""});
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/"].editStatus).toEqual( "DELETED");
});

it('preserves dbId and sets status to DELETED when destroying existing method with 2 protos', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].stuff.value.dbId = "Some UUID";
    var delta = repo.handleDestroyed({subType: "method", name: "main", proto: ""});
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/"].editStatus).toEqual( "DELETED");
    expect(repo.statuses["main/"].stuff.value.dbId).toEqual("Some UUID");
});


const widgetBody = String.raw`@PageWidgetOf("accounts/index.page")
widget IndexPage extends ReactWidget {

    Document method getInitialState () {
        return { view:"Accounts"};
    }

    Html method render () {
        state = getState();
        return <div>
            <AccountsNavbar/>
            <AccountsTable visible={state.view == "Accounts"} />
            <UsersTable visible={state.view == "Users"} />
            <OrganizationsTable visible={state.view == "Organizations"} />
        </div>;
    }

}
`;

it('stores widget body', () => {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent(widgetBody, "O", listener);
    expect(repo.statuses["IndexPage"].editStatus).toEqual( "CREATED");
    expect(clearws(repo.statuses["IndexPage"].stuff.value.body)).toEqual(clearws(widgetBody));
});

const widgetTemplate = String.raw`widget $ {
}
`;

it('sets status to CREATED when adding new widget to an existing one', ()=> {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    const w1 = widgetTemplate.replace('$', 'Existing');
    repo.handleEditContent(w1, "O", listener);
    repo.statuses["Existing"].editStatus = "DIRTY";
    repo.statuses["Existing"].stuff.value.dbId = "Some UUID";
    var listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent(w1, "O", listener);
    const w2 = widgetTemplate.replace('$', 'Created1');
    const w3 = widgetTemplate.replace('$', 'Created2');
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent(w1 + w2 + w3, "O", listener);
    expect(repo.statuses["Existing"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["Created1"].editStatus).toEqual("CREATED");
    expect(repo.statuses["Created2"].editStatus).toEqual("CREATED");
});

it('raises error when duplicating declaration', ()=> {
    var repo = new Repository();
    var listener = new prompto.problem.ProblemCollector();
    const w1 = widgetTemplate.replace('$', 'SomeWidget');
    repo.handleEditContent(w1, "O", listener);
    repo.statuses["SomeWidget"].editStatus = "DIRTY";
    repo.statuses["SomeWidget"].stuff.value.dbId = "Some UUID";
    var listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "O", listener);
    var listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent(w1, "O", listener); // insert a duplicate
    expect(listener.problems.length).toEqual(1);
});

