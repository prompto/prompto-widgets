import Codebase from "./Codebase";

it('creates a Codebase without crashing', () => {
    var codebase = new Codebase();
    expect(codebase).not.toBeNull();
});


