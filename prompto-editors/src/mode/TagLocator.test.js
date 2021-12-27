import TagLocator from "./TagLocator";

it("locates opening tag at start", () => {
    const lines = ["xyz", "abc <x>"];
    const locator = new TagLocator(lines);
    const locationAndTag = locator.locateTagAt({row: 1, column: 4});
    expect(locationAndTag).toEqual({fullTag: "<x>", tagName: "x", location: {row: 1, column: 4}});
});

it("locates opening tag at end", () => {
    const lines = ["xyz", "abc <x>"];
    const locator = new TagLocator(lines);
    const locationAndTag = locator.locateTagAt({row: 1, column: 5});
    expect(locationAndTag).toEqual({fullTag: "<x>", tagName: "x", location: {row: 1, column: 4}});
});

it("does not locate opening tag before column", () => {
    const lines = ["xyz", "abc <x>"];
    const locator = new TagLocator(lines);
    const locationAndTag = locator.locateTagAt({row: 1, column: 3});
    expect(locationAndTag).toBeNull();
});

it("does not locate opening tag before line", () => {
    const lines = ["xyz", "abc <x>"];
    const locator = new TagLocator(lines);
    const locationAndTag = locator.locateTagAt({row: 0, column: 3});
    expect(locationAndTag).toBeNull();
});

it("does not locate opening tag after column", () => {
    const lines = ["xyz", "abc <x>"];
    const locator = new TagLocator(lines);
    const locationAndTag = locator.locateTagAt({row: 1, column: 7});
    expect(locationAndTag).toBeNull();
});

it("does not locate opening tag after line", () => {
    const lines = ["xyz", "abc <x>", "xyz"];
    const locator = new TagLocator(lines);
    const locationAndTag = locator.locateTagAt({row: 2, column: 2});
    expect(locationAndTag).toBeNull();
});


it("does not locate missing closing tag", () => {
    const lines = ["<x>","", "y"];
    const locator = new TagLocator(lines);
    const locationAndTag = locator.locateTagAt({row: 0, column: 2});
    const closing = locator.locateClosingTagOf(locationAndTag);
    expect(closing).toBeNull();
});

it("locates closing tag on same line", () => {
    const lines = ["<x></x>"];
    const locator = new TagLocator(lines);
    const locationAndTag = locator.locateTagAt({row: 0, column: 2});
    const closing = locator.locateClosingTagOf(locationAndTag);
    expect(closing).toEqual({ fullTag: "</x>", tagName: "/x", location: {row: 0, column: 3}});
});

it("locates closing tag on next line", () => {
    const lines = ["<x>", "</x>"];
    const locator = new TagLocator(lines);
    const locationAndTag = locator.locateTagAt({row: 0, column: 2});
    const closing = locator.locateClosingTagOf(locationAndTag);
    expect(closing).toEqual({ fullTag: "</x>", tagName: "/x", location: {row: 1, column: 0}});
});

it("locates embedded closing tag on same line", () => {
    const lines = ["<x><x></x></x>"];
    const locator = new TagLocator(lines);
    const locationAndTag = locator.locateTagAt({row: 0, column: 5});
    const closing = locator.locateClosingTagOf(locationAndTag);
    expect(closing).toEqual({ fullTag: "</x>", tagName: "/x", location: {row: 0, column: 6}});
});

it("locates embedded closing tag on next line", () => {
    const lines = ["<x><x>", "</x></x>"];
    const locator = new TagLocator(lines);
    const locationAndTag = locator.locateTagAt({row: 0, column: 5});
    const closing = locator.locateClosingTagOf(locationAndTag);
    expect(closing).toEqual({ fullTag: "</x>", tagName: "/x", location: {row: 1, column: 0}});
});

it("locates enclosing closing tag on same line", () => {
    const lines = ["<x><x></x></x>"];
    const locator = new TagLocator(lines);
    const locationAndTag = locator.locateTagAt({row: 0, column: 2});
    const closing = locator.locateClosingTagOf(locationAndTag);
    expect(closing).toEqual({ fullTag: "</x>", tagName: "/x", location: {row: 0, column: 10}});
});

it("locates enclosing closing tag on next line", () => {
    const lines = ["<x><x></x>", "</x>"];
    const locator = new TagLocator(lines);
    const locationAndTag = locator.locateTagAt({row: 0, column: 2});
    const closing = locator.locateClosingTagOf(locationAndTag);
    expect(closing).toEqual({ fullTag: "</x>", tagName: "/x", location: {row: 1, column: 0}});
});



