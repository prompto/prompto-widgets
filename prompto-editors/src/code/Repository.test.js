import path from 'path';
import fs from 'fs';
import Repository from './Repository';

const { prompto } = jest.requireActual("../../../../prompto-javascript/JavaScript-Core/src/main/index.js");

function fixPath(filePath) {
    return path.normalize(path.dirname(path.dirname(module.filename)) + "/" + filePath);
}

function loadText(filePath) {
    return fs.readFileSync(fixPath(filePath), {encoding: 'utf8'});
}

function clearws(text) {
    return text.replace(/([\n\r\t])+/g, "");
}

test.skip('code is loaded', () => {
    global.Event = function () {}; // referred by web stuff
    const code = loadText("../../../src/main/resources/prompto/prompto.pec");
    const repo = new Repository();
    repo.registerLibraryCode(code, "E");
    expect(repo.librariesContext).not.toBeNull();
    expect(Object.keys(repo.librariesContext.declarations).length > 0).toBeTruthy();
});

it('sets status of new attribute to CREATED', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define name as Text attribute", "E", listener);
    expect(delta.added.attributes[0]).toEqual("name");
    expect(repo.statuses["name"].editStatus).toEqual("CREATED");
});

it('sets status of new attributes to CREATED', () => {
    const repo = new Repository();
    const inputs = [
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
    inputs.forEach(function(input) {
        repo.handleEditContent(input, "E", new prompto.problem.ProblemCollector());
    });
    const names = Object.getOwnPropertyNames(repo.statuses);
    expect(names.length).toEqual(3);
    expect(repo.statuses["count"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["xcounts"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["names"].editStatus).toEqual( "CREATED");
});

it('preserves CREATED status of new attribute when updating it', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define name as Integer attribute", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["name"].editStatus).toEqual("CREATED");
    expect(clearws(repo.statuses["name"].resource.value.body)).toEqual(clearws("define name as Integer attribute"));
});

it('preserves dbId and sets DIRTY status when updating existing attribute', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Integer attribute", "E", listener);
    repo.statuses["name"].editStatus = "CLEAN";
    repo.statuses["name"].resource.value.dbId = "Some UUID";
    const delta = repo.handleEditContent("define name as Text attribute", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["name"].editStatus).toEqual("DIRTY");
    expect(repo.statuses["name"].resource.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["name"].resource.value.body)).toEqual(clearws("define name as Text attribute"));
});

it('preserves dbId and sets DIRTY status when changing dialect', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    repo.statuses["name"].editStatus = "CLEAN";
    repo.statuses["name"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    /* const delta = */ repo.handleEditContent("attribute name: Text;", "O", listener);
    expect(repo.statuses["name"].editStatus).toEqual("DIRTY");
    expect(repo.statuses["name"].resource.value.dbId).toEqual("Some UUID");
    expect(repo.statuses["name"].resource.value.dialect).toEqual("O");
    expect(repo.statuses["name"].resource.value.body).toEqual("attribute name: Text;");
});

it('preserves CREATED status after selecting and updating', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define name as Text attribute", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define name as Integer attribute", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["name"].editStatus).toEqual("CREATED");
    expect(repo.statuses["name"].resource.value.body).toEqual("define name as Integer attribute");
});

it('preserves CREATED status when renaming new attribute', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define renamed as Text attribute", "E", listener);
    expect(delta.removed.attributes[0]).toEqual("name");
    expect(delta.added.attributes[0]).toEqual("renamed");
    expect(repo.statuses["name"]).toBeUndefined();
    expect(repo.statuses["renamed"].editStatus).toEqual("CREATED");
});


it('preserves CREATED status when renaming DIRTY attribute', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    repo.statuses["name"].editStatus = "CLEAN";
    repo.statuses["name"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define renamed as Text attribute", "E", listener);
    expect(delta.removed.attributes[0]).toEqual("name");
    expect(delta.added.attributes[0]).toEqual("renamed");
    expect(repo.statuses["name"]).toBeUndefined();
    expect(repo.statuses["renamed"].resource.value.dbId).toEqual("Some UUID");
    expect(repo.statuses["renamed"].editStatus).toEqual("DIRTY");
});


it('preserves dbId and DIRTY status when renaming DIRTY attribute', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    repo.statuses["name"].editStatus = "CLEAN";
    repo.statuses["name"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    let delta = repo.handleSetContent("define name as Text attribute", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    delta = repo.handleEditContent("define renamed as Text attribute", "E", listener);
    expect(delta.removed.attributes[0]).toEqual("name");
    expect(delta.added.attributes[0]).toEqual("renamed");
    expect(repo.statuses["name"]).toBeUndefined();
    expect(repo.statuses["renamed"].resource.value.dbId).toEqual("Some UUID");
    expect(repo.statuses["renamed"].editStatus).toEqual("DIRTY");
});


it('sets status to DELETED when destroying new attribute', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    expect(repo.statuses["name"].editStatus).toEqual("CREATED");
    const delta = repo.handleDestroyed({subType: "attribute", name: "name"});
    expect(delta.removed.attributes[0]).toEqual("name");
    expect(repo.statuses["name"].editStatus).toEqual("DELETED");
});

it('sets status to DELETED when destroying existing attribute', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    repo.statuses["name"].editStatus = "CLEAN";
    repo.statuses["name"].resource.value.dbId = "Some UUID";
    const delta = repo.handleDestroyed({subType: "attribute", name: "name"});
    expect(delta.removed.attributes[0]).toEqual("name");
    expect(repo.statuses["name"].resource.value.dbId).toEqual("Some UUID");
    expect(repo.statuses["name"].editStatus).toEqual("DELETED");
});


it('sets status to DELETED when selecting then destroying new attribute', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define name as Text attribute", "E", listener);
    const delta = repo.handleDestroyed({subType: "attribute", name: "name"});
    expect(delta.removed.attributes[0]).toEqual("name");
    expect(repo.statuses["name"].editStatus).toEqual("DELETED");
});

it('sets status to DELETED when selecting then destroying existing attribute', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define name as Text attribute", "E", listener);
    repo.statuses["name"].editStatus = "CLEAN";
    repo.statuses["name"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define name as Text attribute", "E", listener);
    const delta = repo.handleDestroyed({subType: "attribute", name: "name"});
    expect(delta.removed.attributes[0]).toEqual("name");
    expect(repo.statuses["name"].resource.value.dbId).toEqual("Some UUID");
    expect(repo.statuses["name"].editStatus).toEqual("DELETED");
});

it('sets status of new category to CREATED', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    expect(delta.added.categories[0]).toEqual("Xyz");
    expect(repo.statuses["Xyz"].editStatus).toEqual("CREATED");
});


it('preserves status of new category to CREATED when updating', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define Xyz as category with attribute other", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["Xyz"].editStatus).toEqual("CREATED");
    expect(clearws(repo.statuses["Xyz"].resource.value.body)).toEqual("define Xyz as category with attribute other");
});

it('preserves dbId and sets status to DIRTY when updating existing category', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    repo.statuses["Xyz"].editStatus = "CLEAN";
    repo.statuses["Xyz"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define Xyz as category with attribute other", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["Xyz"].editStatus).toEqual("DIRTY");
    expect(repo.statuses["Xyz"].resource.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["Xyz"].resource.value.body)).toEqual("define Xyz as category with attribute other");
});

it('preserves CREATED status when selecting then updating category', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define Xyz as category with attribute other", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["Xyz"].editStatus).toEqual("CREATED");
    expect(clearws(repo.statuses["Xyz"].resource.value.body)).toEqual("define Xyz as category with attribute other");
});

it('preserves dbId and sets status to DIRTY when selecting then updating existing category', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    repo.statuses["Xyz"].editStatus = "CLEAN";
    repo.statuses["Xyz"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define Xyz as category with attribute other", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["Xyz"].editStatus).toEqual("DIRTY");
    expect(repo.statuses["Xyz"].resource.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["Xyz"].resource.value.body)).toEqual("define Xyz as category with attribute other");
});

it('preserves CREATED status when renaming new category', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define Abc as category with attribute name", "E", listener);
    expect(delta.removed.categories[0]).toEqual("Xyz");
    expect(delta.added.categories[0]).toEqual("Abc");
    expect(repo.statuses["Xyz"]).toBeUndefined();
    expect(repo.statuses["Abc"].editStatus).toEqual("CREATED");
});

it('preserves dbId and sets status to DIRTY when renaming existing category', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    repo.statuses["Xyz"].editStatus = "CLEAN";
    repo.statuses["Xyz"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define Abc as category with attribute other", "E", listener);
    expect(delta.removed.categories[0]).toEqual("Xyz");
    expect(delta.added.categories[0]).toEqual("Abc");
    expect(repo.statuses["Xyz"]).toBeUndefined();
    expect(repo.statuses["Abc"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["Abc"].resource.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["Abc"].resource.value.body)).toEqual("define Abc as category with attribute other");
});

it('preserves CREATED status when selecting then renaming new category', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define Abc as category with attribute name", "E", listener);
    expect(delta.removed.categories[0]).toEqual("Xyz");
    expect(delta.added.categories[0]).toEqual("Abc");
    expect(repo.statuses["Xyz"]).toBeUndefined();
    expect(repo.statuses["Abc"].editStatus).toEqual( "CREATED");
});

it('preserves dbId and sets status to DIRTY when selecting then renaming existing category', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    repo.statuses["Xyz"].editStatus = "CLEAN";
    repo.statuses["Xyz"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define Abc as category with attribute other", "E", listener);
    expect(delta.removed.categories[0]).toEqual("Xyz");
    expect(delta.added.categories[0]).toEqual("Abc");
    expect(repo.statuses["Xyz"]).toBeUndefined();
    expect(repo.statuses["Abc"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["Abc"].resource.value.dbId).toEqual("Some UUID");
    expect(repo.statuses["Abc"].resource.value.body).toEqual("define Abc as category with attribute other");
});

it('sets status to DELETED when destroying new category', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    expect(repo.statuses["Xyz"].editStatus).toEqual( "CREATED");
    const delta = repo.handleDestroyed({subType: "category", name: "Xyz"});
    expect(delta.removed.categories[0]).toEqual("Xyz");
    expect(repo.statuses["Xyz"].editStatus).toEqual( "DELETED");
});


it('preserves dbId and sets status to DELETED when destroying existing category', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    repo.statuses["Xyz"].editStatus = "CLEAN";
    repo.statuses["Xyz"].resource.value.dbId = "Some UUID";
    const delta = repo.handleDestroyed({subType: "category", name: "Xyz"});
    expect(delta.removed.categories[0]).toEqual("Xyz");
    expect(repo.statuses["Xyz"].resource.value.dbId).toEqual("Some UUID");
    expect(repo.statuses["Xyz"].editStatus).toEqual( "DELETED");
});

it('sets status to DELETED when selecting then destroying new category', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define Xyz as category with attribute name", "E", listener);
    repo.registerDestroyed({category: "Xyz"});
    const delta = repo.handleDestroyed({subType: "category", name: "Xyz"});
    expect(delta.removed.categories[0]).toEqual("Xyz");
    expect(repo.statuses["Xyz"].editStatus).toEqual( "DELETED");
});

it('preserves dbId and sets status to DELETED when selecting then destroying existing category', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define Xyz as category with attribute name", "E", listener);
    repo.statuses["Xyz"].editStatus = "CLEAN";
    repo.statuses["Xyz"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define Xyz as category with attribute name", "E", listener);
    const delta = repo.handleDestroyed({subType: "category", name: "Xyz"});
    expect(delta.removed.categories[0]).toEqual("Xyz");
    expect(repo.statuses["Xyz"].resource.value.dbId).toEqual("Some UUID");
    expect(repo.statuses["Xyz"].editStatus).toEqual( "DELETED");
});


it('sets status of new test to CREATED', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent('define "simple test" as test method doing:\n\ta = 3\nand verifying:\n\ta = 2', "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses['"simple test"'].editStatus).toEqual( "CREATED");
    expect(clearws(repo.statuses['"simple test"'].resource.value.body)).toEqual(clearws('define "simple test" as test method doing:\n\ta = 3\nand verifying:\n\ta = 2\n'));
});


it('preserves CREATED status when selecting then updating new test', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent('define "simple test" as test method doing:\n\ta = 3\nand verifying:\n\ta = 2', "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses['"simple test"'].editStatus).toEqual( "CREATED");
    expect(clearws(repo.statuses['"simple test"'].resource.value.body)).toEqual(clearws('define "simple test" as test method doing:\n\ta = 3\nand verifying:\n\ta = 2\n'));
});

it('preserves dbId and sets status to DIRTY when selecting then updating existing test', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    repo.statuses['"simple test"'].editStatus = "CLEAN";
    repo.statuses['"simple test"'].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent('define "simple test" as test method doing:\n\ta = 3\nand verifying:\n\ta = 2', "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses['"simple test"'].editStatus).toEqual("DIRTY");
    expect(repo.statuses['"simple test"'].resource.value.dbId).toEqual('Some UUID');
    expect(clearws(repo.statuses['"simple test"'].resource.value.body)).toEqual(clearws('define "simple test" as test method doing:\n\ta = 3\nand verifying:\n\ta = 2\n'));
});

it('preserves CREATED status when renaming new test', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent('define "renamed test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    expect(delta.removed.tests[0]).toEqual('"simple test"');
    expect(delta.added.tests[0]).toEqual('"renamed test"');
    expect(repo.statuses['"simple test"']).toBeUndefined();
    expect(repo.statuses['"renamed test"'].editStatus).toEqual( "CREATED");
});

it('preserves dbId and sets status to DIRTY when renaming existing test', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    repo.statuses['"simple test"'].editStatus = "CLEAN";
    repo.statuses['"simple test"'].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent('define "renamed test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    expect(delta.removed.tests[0]).toEqual('"simple test"');
    expect(delta.added.tests[0]).toEqual('"renamed test"');
    expect(repo.statuses['"simple test"']).toBeUndefined();
    expect(repo.statuses['"renamed test"'].editStatus).toEqual( "DIRTY");
    expect(repo.statuses['"renamed test"'].resource.value.dbId).toEqual('Some UUID');
});


it('preserves CREATED status when selecting then renaming new test', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent('define "renamed test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    expect(delta.removed.tests[0]).toEqual('"simple test"');
    expect(delta.added.tests[0]).toEqual('"renamed test"');
    expect(repo.statuses['"simple test"']).toBeUndefined();
    expect(repo.statuses['"renamed test"'].editStatus).toEqual( "CREATED");
});


it('preserves dbId and sets status to DIRTY when selecting then renaming existing test', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    repo.statuses['"simple test"'].editStatus = "CLEAN";
    repo.statuses['"simple test"'].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent('define "renamed test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    expect(delta.removed.tests[0]).toEqual('"simple test"');
    expect(delta.added.tests[0]).toEqual('"renamed test"');
    expect(repo.statuses['"simple test"']).toBeUndefined();
    expect(repo.statuses['"renamed test"'].editStatus).toEqual( "DIRTY");
    expect(repo.statuses['"renamed test"'].resource.value.dbId).toEqual('Some UUID');
});


it('sets status to DELETED when destroying new test', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    expect(repo.statuses['"simple test"'].editStatus).toEqual( "CREATED");
    const delta = repo.handleDestroyed({type: "test", name: '"simple test"'});
    expect(delta.removed.tests[0]).toEqual('"simple test"');
    expect(repo.statuses['"simple test"'].editStatus).toEqual( "DELETED");
});

it('sets status to DELETED when destroying existing test', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    repo.statuses['"simple test"'].editStatus = "CLEAN";
    repo.statuses['"simple test"'].resource.value.dbId = "Some UUID";
    const delta = repo.handleDestroyed({type: "test", name: '"simple test"'});
    expect(delta.removed.tests[0]).toEqual('"simple test"');
    expect(repo.statuses['"simple test"'].editStatus).toEqual( "DELETED");
    expect(repo.statuses['"simple test"'].resource.value.dbId).toEqual('Some UUID');
});

it('sets status to DELETED when selecting then destroying new test', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    const delta = repo.handleDestroyed({type: "test", name: '"simple test"'});
    expect(delta.removed.tests[0]).toEqual('"simple test"');
    expect(repo.statuses['"simple test"'].editStatus).toEqual( "DELETED");
});


it('sets status to DELETED when selecting then destroying existing test', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    repo.statuses['"simple test"'].editStatus = "CLEAN";
    repo.statuses['"simple test"'].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent('define "simple test" as test method doing:\n\ta = 2\nand verifying:\n\ta = 2', "E", listener);
    const delta = repo.handleDestroyed({type: "test", name: '"simple test"'});
    expect(delta.removed.tests[0]).toEqual('"simple test"');
    expect(repo.statuses['"simple test"'].editStatus).toEqual( "DELETED");
    expect(repo.statuses['"simple test"'].resource.value.dbId).toEqual('Some UUID');
});

it('sets status of new method to CREATED', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/"].editStatus).toEqual( "CREATED");
});

it('preserves CREATED status when updating new method', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define main as method doing:\n\ta = 3\n", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["main/"].editStatus).toEqual( "CREATED");
    expect(clearws(repo.statuses["main/"].resource.value.body)).toEqual(clearws("define main as method doing:\n\ta = 3\n"));
});


it('preserves dbId and sets status to DIRTY when updating existing method', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define main as method doing:\n\ta = 3\n", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["main/"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["main/"].resource.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/"].resource.value.body)).toEqual(clearws("define main as method doing:\n\ta = 3\n"));
});

it('preserves CREATED status when selecting then updating new method', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define main as method doing:\n\ta = 3\n", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["main/"].editStatus).toEqual( "CREATED");
    expect(clearws(repo.statuses["main/"].resource.value.body)).toEqual(clearws("define main as method doing:\n\ta = 3\n"));
});


it('preserves dbId and sets status to DIRTY when selecting then updating existing method', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define main as method doing:\n\ta = 3\n", "E", listener);
    expect(delta).toBeNull();
    expect(repo.statuses["main/"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["main/"].resource.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/"].resource.value.body)).toEqual(clearws("define main as method doing:\n\ta = 3\n"));
});

it('preserves CREATED status when renaming new method', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define renamed as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].name).toEqual("renamed");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["renamed/"].editStatus).toEqual( "CREATED");
});

it('preserves dbId and sets status to DIRTY when renaming existing method', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define renamed as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].name).toEqual("renamed");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["renamed/"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["renamed/"].resource.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["renamed/"].resource.value.body)).toEqual(clearws("define renamed as method doing:\n\ta = 2\n"));
});

it('preserves CREATED status when renaming new method with 1 proto', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define renamed as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].name).toEqual("renamed");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["renamed/"].editStatus).toEqual( "CREATED");
});

it('preserves dbId and sets status to DIRTY when renaming existing method with 1 proto', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define renamed as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].name).toEqual("renamed");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["renamed/"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["renamed/"].resource.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["renamed/"].resource.value.body)).toEqual(clearws("define renamed as method doing:\n\ta = 2\n"));
});

it('preserves CREATED status when updating proto of new method with 1 proto', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual("Text");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
});

it('preserves dbId and sets status to DIRTY when updating proto of existing method with 1 proto', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual("Text");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["main/Text"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["main/Text"].resource.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/Text"].resource.value.body)).toEqual(clearws("define main as method receiving Text value doing:\n\ta = 2\n"));
});

it('preserves CREATED status when selecting then updating proto of new method with 1 proto', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual("Text");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
});


it('preserves dbId and sets status to DIRTY when selecting then updating proto of existing method with 1 proto', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual("Text");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["main/Text"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["main/Text"].resource.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/Text"].resource.value.body)).toEqual(clearws("define main as method receiving Text value doing:\n\ta = 2\n"));
});

it('preserves dbId and sets status to DIRTY when selecting then updating proto of existing abstract method with 1 proto', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define text as Text attribute\ndefine main as abstract method receiving Text value\n", "E", listener);
    repo.statuses["main/Text"].editStatus = "CLEAN";
    repo.statuses["main/Text"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as abstract method receiving Text value\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define main as abstract method receiving text\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos.length).toEqual(1);
    expect(delta.removed.methods[0].protos[0].proto).toEqual("Text");
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos.length).toEqual(1);
    expect(delta.added.methods[0].protos[0].proto).toEqual("text");
    expect(repo.statuses["main/Text"]).toBeUndefined();
    expect(repo.statuses["main/text"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["main/text"].resource.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/text"].resource.value.body)).toEqual(clearws("define main as abstract method receiving text\n"));
});

it('preserves CREATED status when renaming new method with 2 protos', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define renamed as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("renamed");
    expect(delta.added.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["renamed/"].editStatus).toEqual( "CREATED");
});


it('preserves dbId and sets status to DIRTY when renaming existing method with 2 protos', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define renamed as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("renamed");
    expect(delta.added.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["renamed/"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["renamed/"].resource.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["renamed/"].resource.value.body)).toEqual(clearws("define renamed as method doing:\n\ta = 2\n"));
});

it('preserves CREATED status when selecting then renaming new method with 2 protos', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define renamed as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("renamed");
    expect(delta.added.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["renamed/"].editStatus).toEqual( "CREATED");
});


it('preserves dbId and sets status to DIRTY when selecting then renaming existing method with 2 protos', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define renamed as method doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("renamed");
    expect(delta.added.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["renamed/"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["renamed/"].resource.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["renamed/"].resource.value.body)).toEqual(clearws("define renamed as method doing:\n\ta = 2\n"));
});

it('preserves CREATED status when updating proto of new method with 2 protos', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define main as method receiving Integer value doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual("Integer");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/Integer"].editStatus).toEqual( "CREATED");
});


it('preserves dbId and sets status to DIRTY when updating proto of existing method with 2 protos', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define main as method receiving Integer value doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual("Integer");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/Integer"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["main/Integer"].resource.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/Integer"].resource.value.body)).toEqual(clearws("define main as method receiving Integer value doing:\n\ta = 2"));
});


it('preserves CREATED status when selecting then updating proto of new method with 2 protos', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define main as method receiving Integer value doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual("Integer");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/Integer"].editStatus).toEqual( "CREATED");
});


it('preserves dbId and sets status to DIRTY when selecting then updating proto of existing method with 2 protos', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    const delta = repo.handleEditContent("define main as method receiving Integer value doing:\n\ta = 2\n", "E", listener);
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(delta.added.methods[0].name).toEqual("main");
    expect(delta.added.methods[0].protos[0].proto).toEqual("Integer");
    expect(repo.statuses["main/"]).toBeUndefined();
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/Integer"].editStatus).toEqual( "DIRTY");
    expect(repo.statuses["main/Integer"].resource.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/Integer"].resource.value.body)).toEqual(clearws("define main as method receiving Integer value doing:\n\ta = 2\n"));
});

it('sets status to DELETED when destroying new method with 1 proto', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    expect(repo.statuses["main/"].editStatus).toEqual( "CREATED");
    const delta = repo.handleDestroyed({type: "MethodRef", name: "main", proto: ""});
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/"].editStatus).toEqual( "DELETED");
});

it('preserves dbId and sets status to DELETED when destroying existing method with 1 proto', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].resource.value.dbId = "Some UUID";
    const delta = repo.handleDestroyed({type: "MethodRef", name: "main", proto: ""});
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/"].editStatus).toEqual( "DELETED");
    expect(repo.statuses["main/"].resource.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/"].resource.value.body)).toEqual(clearws("define main as method doing:\n\ta = 2\n"));
});

it('sets status to DELETED when selecting then destroying new method with 1 proto', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    expect(repo.statuses["main/"].editStatus).toEqual( "CREATED");
    const delta = repo.handleDestroyed({type: "MethodRef", name: "main", proto: ""});
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/"].editStatus).toEqual( "DELETED");
});

it('preserves dbId and sets status to DELETED when selecting then destroying existing method with 1 proto', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("define main as method doing:\n\ta = 2\n", "E", listener);
    const delta = repo.handleDestroyed({type: "MethodRef", name: "main", proto: ""});
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/"].editStatus).toEqual( "DELETED");
    expect(repo.statuses["main/"].resource.value.dbId).toEqual("Some UUID");
    expect(clearws(repo.statuses["main/"].resource.value.body)).toEqual(clearws("define main as method doing:\n\ta = 2\n"));
});

it('sets status to DELETED when destroying new method with 2 protos', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    expect(repo.statuses["main/"].editStatus).toEqual( "CREATED");
    const delta = repo.handleDestroyed({type: "MethodRef", name: "main", proto: ""});
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/"].editStatus).toEqual( "DELETED");
});

it('preserves dbId and sets status to DELETED when destroying existing method with 2 protos', () => {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method receiving Text value doing:\n\ta = 2\n", "E", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "E", listener); // new
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent("define main as method doing:\n\ta = 2\n", "E", listener);
    repo.statuses["main/"].editStatus = "CLEAN";
    repo.statuses["main/"].resource.value.dbId = "Some UUID";
    const delta = repo.handleDestroyed({type: "MethodRef", name: "main", proto: ""});
    expect(delta.removed.methods[0].name).toEqual("main");
    expect(delta.removed.methods[0].protos[0].proto).toEqual('');
    expect(repo.statuses["main/Text"].editStatus).toEqual( "CREATED");
    expect(repo.statuses["main/"].editStatus).toEqual( "DELETED");
    expect(repo.statuses["main/"].resource.value.dbId).toEqual("Some UUID");
});



it('stores widget body', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    const code = String.raw`@PageWidgetOf("accounts/index.page")
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
    repo.handleEditContent(code, "O", listener);
    expect(repo.statuses["IndexPage"].editStatus).toEqual( "CREATED");
    expect(clearws(repo.statuses["IndexPage"].resource.value.body)).toEqual(clearws(code));
});

const widgetTemplate = String.raw`widget $ {
}
`;

it('sets status to CREATED when adding new widget to an existing one', ()=> {
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    const w1 = widgetTemplate.replace('$', 'Existing');
    repo.handleEditContent(w1, "O", listener);
    repo.statuses["Existing"].editStatus = "DIRTY";
    repo.statuses["Existing"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
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
    const repo = new Repository();
    let listener = new prompto.problem.ProblemCollector();
    const w1 = widgetTemplate.replace('$', 'SomeWidget');
    repo.handleEditContent(w1, "O", listener);
    repo.statuses["SomeWidget"].editStatus = "DIRTY";
    repo.statuses["SomeWidget"].resource.value.dbId = "Some UUID";
    listener = new prompto.problem.ProblemCollector();
    repo.handleSetContent("", "O", listener);
    listener = new prompto.problem.ProblemCollector();
    repo.handleEditContent(w1, "O", listener); // insert a duplicate
    expect(listener.problems.length).toEqual(1);
});

it('createBreakpointAtLine returns null when pointing to attribute', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    const code = String.raw`define name as Text attribute
`;
    repo.handleEditContent(code, "E", listener);
    const brkpt = repo.createBreakpointAtLine({type: "AttributeRef", name: "name" }, 1, "E");
    expect(brkpt).toBeNull();
});

it('createBreakpointAtLine returns correct line when pointing to statement of global method', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    const code = String.raw`define main as method doing:
    a = 2
`;
    repo.handleEditContent(code, "E", listener);
    const brkpt = repo.createBreakpointAtLine({type: "MethodRef", name: "main", prototype: ""}, 2, "E");
    expect(brkpt).not.toBeNull();
    expect(brkpt.methodName).toEqual("main");
    expect(brkpt.methodProto).toEqual("");
    expect(brkpt.statementLine).toEqual(2);
});

it('createBreakpointAtLine returns null when pointing to method prototype', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    const code = String.raw`define main as method doing:
    a = 2
`;
    repo.handleEditContent(code, "E", listener);
    const brkpt = repo.createBreakpointAtLine({type: "MethodRef", name: "main", prototype: ""}, 1, "E");
    expect(brkpt).toBeNull();
});

it('createBreakpointAtLine returns null when pointing to global method comment', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    const code = String.raw`define main as method doing:
    // comment
    a = 2
`;
    repo.handleEditContent(code, "E", listener);
    const brkpt = repo.createBreakpointAtLine({type: "MethodRef", name: "main", prototype: ""}, 2, "E");
    expect(brkpt).toBeNull();
});

it('createBreakpointAtLine returns null when pointing to blank line of global method ', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    const code = String.raw`define main as method doing:
    
    a = 2
`;
    repo.handleEditContent(code, "E", listener);
    const brkpt = repo.createBreakpointAtLine({type: "MethodRef", name: "main", prototype: ""}, 2, "E");
    expect(brkpt).toBeNull();
});

it('createBreakpointAtLine returns inner statement of if statement', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    const code = String.raw`method extract (Document config) {
    http = config.http;
    if (http is not null) {
        keyStore = http.keyStore;
        if (keyStore is not null) {
            secretKey = keyStore.secretKey;
            if (secretKey is a Document)
            if ("prompto.security.AwsKMSSecretKeyFactory" == secretKey.factory)
                return {factory:secretKey.factory, awsRegion:secretKey.awsRegion, alias:secretKey.alias};
        }
    }
    // TODO remove cast 
    return (Document)null;
}
`;
    repo.handleEditContent(code, "O", listener);
    let brkpt = repo.createBreakpointAtLine({type: "MethodRef", name: "extract", prototype: "Document"}, 9, "O");
    expect(brkpt).not.toBeNull();
    expect(brkpt.methodName).toEqual("extract");
    expect(brkpt.methodProto).toEqual("Document");
    expect(brkpt.statementLine).toEqual(9);
});


it('createBreakpointAtLine returns inner statement of for each statement', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    const code = String.raw`method detachComponents (Stuff[] stuffs) {
    components = (Stuff[])[];
    for each (stuff in stuffs) {
        component = mutable stuff;
        component.dbId = null;
        component.module = null;
        components = components + [component];
    }
    return components;
}
`;
    repo.handleEditContent(code, "O", listener);
    let brkpt = repo.createBreakpointAtLine({type: "MethodRef", name: "detachComponents", prototype: "Stuff[]"}, 3, "O");
    expect(brkpt).not.toBeNull();
    expect(brkpt.methodName).toEqual("detachComponents");
    expect(brkpt.methodProto).toEqual("Stuff[]");
    expect(brkpt.statementLine).toEqual(3);
    brkpt = repo.createBreakpointAtLine({type: "MethodRef", name: "detachComponents", prototype: "Stuff[]"}, 5, "O");
    expect(brkpt).not.toBeNull();
    expect(brkpt.statementLine).toEqual(5);
});

it('createBreakpointAtLine returns inner statement of catch clause', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    const code = String.raw`method isRunningOnEC2 () {
    try (error) {
        path = "file:/sys/devices/virtual/dmi/id/bios_version";
        data = read all from Url(path = path);
        return "amazon" in data;
    } catch (READ_WRITE) {
        return false;
    }
}
`;
    repo.handleEditContent(code, "O", listener);
    let brkpt = repo.createBreakpointAtLine({type: "MethodRef", name: "isRunningOnEC2", prototype: ""}, 2, "O");
    expect(brkpt).toBeNull();
    brkpt = repo.createBreakpointAtLine({type: "MethodRef", name: "isRunningOnEC2", prototype: ""}, 3, "O");
    expect(brkpt).not.toBeNull();
    expect(brkpt.methodName).toEqual("isRunningOnEC2");
    expect(brkpt.methodProto).toEqual("");
    expect(brkpt.statementLine).toEqual(3);
    brkpt = repo.createBreakpointAtLine({type: "MethodRef", name: "isRunningOnEC2", prototype: ""}, 4, "O");
    expect(brkpt).not.toBeNull();
    expect(brkpt.statementLine).toEqual(4);
    brkpt = repo.createBreakpointAtLine({type: "MethodRef", name: "isRunningOnEC2", prototype: ""}, 5, "O");
    expect(brkpt).not.toBeNull();
    expect(brkpt.statementLine).toEqual(5);
    brkpt = repo.createBreakpointAtLine({type: "MethodRef", name: "isRunningOnEC2", prototype: ""}, 6, "O");
    expect(brkpt).toBeNull();
    brkpt = repo.createBreakpointAtLine({type: "MethodRef", name: "isRunningOnEC2", prototype: ""}, 7, "O");
    expect(brkpt).not.toBeNull();
    expect(brkpt.statementLine).toEqual(7);
});

it('createBreakpointAtLine returns breakpoint in other dialect', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    const code = String.raw`method extract (Document config) {
    http = config.http;
    if (http is not null) {
        keyStore = http.keyStore;
        if (keyStore is not null) {
            secretKey = keyStore.secretKey;
            if (secretKey is a Document)
            if ("prompto.security.AwsKMSSecretKeyFactory" == secretKey.factory)
                return {factory:secretKey.factory, awsRegion:secretKey.awsRegion, alias:secretKey.alias};
        }
    }
    // TODO remove cast 
    return (Document)null;
}
`;
    repo.handleEditContent(code, "O", listener);
    let brkpt = repo.createBreakpointAtLine({type: "MethodRef", name: "extract", prototype: "Document"}, 11, "E");
    expect(brkpt).not.toBeNull();
    expect(brkpt.methodName).toEqual("extract");
    expect(brkpt.methodProto).toEqual("Document");
    expect(brkpt.statementLine).toEqual(11);
});

it('createBreakpointAtLine returns breakpoint in test method', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    const code = String.raw`test method "AMI version is extracted" () {
    ami = {Name:"centos-prompto-v0.0.205"};
    version = getAMIVersion(value = ami);
} verifying {
    version == 'v0.0.205';
}
`;
    repo.handleEditContent(code, "O", listener);
    let brkpt = repo.createBreakpointAtLine({type: "TestRef", name: '"AMI version is extracted"'}, 1, "O");
    expect(brkpt).toBeNull();
    brkpt = repo.createBreakpointAtLine({type: "TestRef", name: '"AMI version is extracted"'}, 2, "O");
    expect(brkpt).not.toBeNull();
    expect(brkpt.methodName).toEqual('"AMI version is extracted"');
    expect(brkpt.statementLine).toEqual(2);
    brkpt = repo.createBreakpointAtLine({type: "TestRef", name: '"AMI version is extracted"'}, 5, "O");
    expect(brkpt).not.toBeNull();
    expect(brkpt.methodName).toEqual('"AMI version is extracted"');
    expect(brkpt.statementLine).toEqual(5);
});

it('createBreakpointAtLine returns breakpoint in category', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    const code = String.raw`category AWSCloud extends CloudImplementation {

    method getFullName () {
        return "Amazon Web Services";
    }

    method isSupported () {
        return true;
    }

    method getDataCenters () {
        return [DataCenter(key = "us-east-1", description = "US East (N. Virginia)"), DataCenter(key = "us-east-2", description = "US East (Ohio)"), DataCenter(key = "us-west-1", description = "US West (N. California)"), DataCenter(key = "us-west-2", description = "US West (Oregon)"), DataCenter(key = "eu-west-1", description = "EU (Ireland)"), DataCenter(key = "eu-west-2", description = "EU (London)"), DataCenter(key = "eu-west-3", description = "EU (Paris)"), DataCenter(key = "eu-central-1", description = "EU (Frankfurt)"), DataCenter(key = "eu-north-1", description = "EU (Stockholm)"), DataCenter(key = "ap-east-1", description = "Asia Pacific (Hong Kong)"), DataCenter(key = "ap-south-1", description = "Asia Pacific (Mumbai)"), DataCenter(key = "ap-southeast-1", description = "Asia Pacific (Singapore)"), DataCenter(key = "ap-southeast-2", description = "Asia Pacific (Sydney)"), DataCenter(key = "ap-northeast-1", description = "Asia Pacific (Tokyo)"), DataCenter(key = "ap-northeast-2", description = "Asia Pacific (Seoul)"), DataCenter(key = "ap-northeast-3", description = "Asia Pacific (Osaka-local)"), DataCenter(key = "sa-east-1", description = "South America (Sao Paulo)"), DataCenter(key = "me-south-1", description = "Middle East (Bahrain)"), DataCenter(key = "cn-north-1", description = "China (Beijing)"), DataCenter(key = "cn-northwest-1", description = "China (Ningxia)"), DataCenter(key = "ca-central-1", description = "Canada (Central)")];
    }

    method getInstanceTypes () {
        types = ["a1.medium", "a1.large", "a1.xlarge", "a1.2xlarge", "a1.4xlarge", "a1.metal"];
        types = types + ["m4.large", "m4.xlarge", "m4.2xlarge", "m4.4xlarge", "m4.10xlarge", "m4.16xlarge"];
        types = types + ["m5.large", "m5.xlarge", "m5.2xlarge", "m5.4xlarge", "m5.8xlarge", "m5.12xlarge", "m5.16xlarge", "m5.24xlarge", "m5.metal"];
        types = types + ["m5a.large", "m5a.xlarge", "m5a.2xlarge", "m5a.4xlarge", "m5a.8xlarge", "m5a.12xlarge", "m5a.16xlarge", "m5a.24xlarge"];
        types = types + ["m5ad.large", "m5ad.xlarge", "m5ad.2xlarge", "m5ad.4xlarge", "m5ad.8xlarge", "m5ad.12xlarge", "m5ad.16xlarge", "m5ad.24xlarge"];
        types = types + ["m5d.large", "m5d.xlarge", "m5d.2xlarge", "m5d.4xlarge", "m5d.8xlarge", "m5d.12xlarge", "m5d.16xlarge", "m5d.24xlarge", "m5d.metal"];
        types = types + ["m5dn.large", "m5dn.xlarge", "m5dn.2xlarge", "m5dn.4xlarge", "m5dn.8xlarge", "m5dn.12xlarge", "m5dn.16xlarge", "m5dn.24xlarge"];
        types = types + ["m5n.large", "m5n.xlarge", "m5n.2xlarge", "m5n.4xlarge", "m5n.8xlarge", "m5n.12xlarge", "m5n.16xlarge", "m5n.24xlarge"];
        types = types + ["t2.nano", "t2.micro", "t2.small", "t2.medium", "t2.large", "t2.xlarge", "t2.2xlarge"];
        types = types + ["t3.nano", "t3.micro", "t3.small", "t3.medium", "t3.large", "t3.xlarge", "t3.2xlarge"];
        types = types + ["t3a.nano", "t3a.micro", "t3a.small", "t3a.medium", "t3a.large", "t3a.xlarge", "t3a.2xlarge"];
        return types;
    }

    method renderInstanceHelp (Text instanceType) {
        return <>See&nbsp;<a href="https://aws.amazon.com/ec2/instance-types" target="_blank" >AWS documentation</a>&nbsp;for instance type description</>;
    }

}
`;
    repo.handleEditContent(code, "O", listener);
    let brkpt = repo.createBreakpointAtLine({type: "CategoryRef", name: "AWSCloud"}, 1, "O");
    expect(brkpt).toBeNull();
    brkpt = repo.createBreakpointAtLine({type: "CategoryRef", name: "AWSCloud"}, 4, "O");
    expect(brkpt).not.toBeNull();
    expect(brkpt.categoryName).toEqual("AWSCloud");
    expect(brkpt.methodName).toEqual("getFullName");
    expect(brkpt.methodProto).toEqual("");
    expect(brkpt.methodLine).toEqual(3);
    expect(brkpt.statementLine).toEqual(4);
    brkpt = repo.createBreakpointAtLine({type: "CategoryRef", name: "AWSCloud"}, 10, "O");
    expect(brkpt).toBeNull();
    brkpt = repo.createBreakpointAtLine({type: "CategoryRef", name: "AWSCloud"}, 18, "O");
    expect(brkpt).not.toBeNull();
    expect(brkpt.categoryName).toEqual("AWSCloud");
    expect(brkpt.methodName).toEqual("getInstanceTypes");
    expect(brkpt.methodProto).toEqual("");
    expect(brkpt.methodLine).toEqual(15);
    expect(brkpt.statementLine).toEqual(18);
});


it('createBreakpointAtLine returns breakpoint in widget', () => {
    const repo = new Repository();
    const listener = new prompto.problem.ProblemCollector();
    const code = String.raw`@WidgetProperties({value:Value})
widget AnyWidget extends ReactWidget {

    method render() {
        return null;
    }

}
`;
    repo.handleEditContent(code, "O", listener);
    let brkpt = repo.createBreakpointAtLine({type: "WidgetRef", name: "AnyWidget"}, 1, "O");
    expect(brkpt).toBeNull();
    brkpt = repo.createBreakpointAtLine({type: "WidgetRef", name: "AnyWidget"}, 5, "O");
    expect(brkpt).not.toBeNull();
    expect(brkpt.categoryName).toEqual("AnyWidget");
    expect(brkpt.methodName).toEqual("render");
    expect(brkpt.methodProto).toEqual("");
    expect(brkpt.methodLine).toEqual(4);
    expect(brkpt.statementLine).toEqual(5);
});