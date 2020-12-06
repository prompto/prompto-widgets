import Catalog from "./Catalog";

it('creates a Codebase without crashing', () => {
    var catalog = new Catalog();
    expect(catalog).not.toBeNull();
});


