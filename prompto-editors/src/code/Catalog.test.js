import Catalog from "./Catalog";

it('creates a Catalog without crashing', () => {
    var catalog = new Catalog();
    expect(catalog).not.toBeNull();
});


