import ChangeBuilder from "./ChangeBuilder";

it("does not find differences in empty texts", () => {
    const changes = ChangeBuilder.computeChanges("", "");
    expect(changes).toEqual([]);
});

it("does not find differences in equal texts", () => {
    const text = "method HelloYou(name) {\n\treturn \"Hello \" + name + \"!!\";\n}\n";
    const changes = ChangeBuilder.computeChanges(text, text);
    expect(changes).toEqual([]);
});

it("finds 1 added difference in new text", () => {
    const text = "method HelloYou_remote() {\n    HelloYou(\"John\") then with message {\n        alert(message);\n    }\n}\n";
    const changes = ChangeBuilder.computeChanges("", text);
    expect(changes).toEqual([{ left: { count: 0, line: 1}, right: { count: 5, line: 1}}]);
});

it("finds 1 deleted difference in deleted text", () => {
    const text = "method HelloYou_remote() {\n    HelloYou(\"John\") then with message {\n        alert(message);\n    }\n}\n";
    const changes = ChangeBuilder.computeChanges(text, "");
    expect(changes).toEqual([{ left: { count: 5, line: 1}, right: { count: 0, line: 1}}]);
});

it("finds 1 added difference in new text 2", () => {
    const text = "method doStuff() {\n    \n}";
    const changes = ChangeBuilder.computeChanges("", text);
    expect(changes).toEqual([{ left: { count: 0, line: 1}, right: { count: 3, line: 1}}]);
});

it("finds 1 deleted difference in deleted text 2", () => {
    const text = "method doStuff() {\n    \n}";
    const changes = ChangeBuilder.computeChanges(text, "");
    expect(changes).toEqual([{ left: { count: 3, line: 1}, right: { count: 0, line: 1}}]);
});
