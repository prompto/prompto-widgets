import fs from 'fs';
import WidgetGenerator from "./WidgetGenerator.js";
import {DEFAULT_HELPERS} from "./DefaultHelpers.js";

export default class WidgetLibraryGenerator {

    constructor(projectDir, globals, helpers, declarations) {
        this.projectDir = projectDir;
        this.globals = globals;
        this.helpers = helpers;
        this.declarations = declarations || [];
    }

    generateLibrary(targetDir) {
        this.readProject();
        fs.mkdirSync(targetDir, { recursive: true });
        this.generateModule(targetDir);
        this.copyNativeResources(targetDir);
        this.generateStub(targetDir);
        this.generatePromptoResource(targetDir);
    }

    readProject() {
        const sep = this.projectDir.endsWith("/") ? "" : "/";
        const projectFile = this.projectDir + sep + "project.json";
        const text = fs.readFileSync(projectFile);
        this.project = JSON.parse(text);
    }

    generateModule(targetDir) {
        const module = Object.assign({}, this.project);
        delete module.prefix;
        delete module.widgets;
        const text = JSON.stringify(module);
        const sep = targetDir.endsWith("/") ? "" : "/";
        const projectFile = targetDir + sep + "module.json";
        fs.writeFileSync(projectFile, text);
    }

    copyNativeResources(targetDir) {
        if (this.project.javaScripts)
            this.project.javaScripts.forEach(res => this.copyNativeResource(targetDir, res));
        if (this.project.styleSheets)
            this.project.styleSheets.forEach(res => this.copyNativeResource(targetDir, res));
        if (this.project.resources)
            this.project.resources.forEach(res => this.copyNativeResource(targetDir, res.url));
    }

    copyNativeResource(targetDir, resource) {
        // only copy local resource
        if(resource && !resource.startsWith("http") && !resource.startsWith("/")) {
            let sep = this.projectDir.endsWith("/") ? "" : "/";
            const localFile = this.projectDir + sep + resource;
            sep = targetDir.endsWith("/") ? "" : "/";
            const targetFile = targetDir + sep + resource;
            fs.copyFileSync(localFile, targetFile);
        }
    }

    generateStub(targetDir) {
        const stubJSResource = this.project.stubJSResource;
        if(stubJSResource) {
            const text = this.createStub();
            const sep = targetDir.endsWith("/") ? "" : "/";
            const targetFile = targetDir + sep + stubJSResource;
            fs.writeFileSync(targetFile, text);
        }
    }

    createStub() {
        return this.createReactStub() + "\n" + this.createWidgetsStubs();
    }

    createReactStub() {
        return "var React = { Component: function() { this.render = function() { return {}; }; return this; } };"
    }

    createWidgetsStubs() {
        const stubs = {};
        const widgets = this.project.widgets;
        widgets.forEach( name => this.createWidgetStubs(stubs, name), this);
        return "self." + this.project.prefix + " = " + this.serialize(stubs) + ";\n";
    }

    serialize(obj) {
        if(typeof(obj) === typeof(""))
            return obj;
        else if(typeof(obj) === typeof({}))
            return "{" + Object.getOwnPropertyNames(obj).map(name => name + ": " + this.serialize(obj[name]), this).join(", ") + " }";
        else
            throw "Not implemented!";
    }

    createWidgetStubs(stubs, widget) {
        const parts = widget.split("\.");
        const name = parts[0];
        if(parts.length === 1) {
            if(!stubs[name])
                stubs[name] = "React.Component";
            else if(typeof(stubs[name]) === typeof({})) {
                stubs[name].render = "React.Component.render";
            }
        } else {
            if(!stubs[name])
                stubs[name] = {};
            else if(typeof(stubs[name]) !== typeof({})) {
                stubs[name] = { render: "React.Component.render" };
            }
            parts.splice(0, 1);
            this.createWidgetStubs(stubs[name], parts.join("."));
        }
    }

    generatePromptoResource(targetDir) {
        const widgets = this.project.widgets.map( name => this.generateWidgetCode( name ), this);
        const texts = widgets.concat(this.declarations);
        const sep = targetDir.endsWith("/") ? "" : "/";
        const targetFile = targetDir + sep + this.project.promptoResource;
        fs.writeFileSync(targetFile, texts.join("\n"));
    }

    generateWidgetCode(nativeName) {
        const helpers = this.getHelpers(nativeName);
        const klass = this.loadClass(this.globals, nativeName);
        if(klass) {
            const generator = new WidgetGenerator(nativeName, klass, helpers);
            const promptoName = nativeName.replace(/\./g, "");
            return generator.generate(promptoName, this.project.prefix + "." + nativeName);
        } else
            console.error("Could not find class: " + nativeName);
    }

    getHelpers(promptoName) {
        const genericHelpers = this.helpers["*"] || {};
        const specificHelpers = this.helpers[promptoName] || {};
        return Object.assign({}, DEFAULT_HELPERS, genericHelpers, specificHelpers);
    }

    loadClass(globals, nativeName) {
        const parts = nativeName.split("\.");
        const name = parts[0];
        if(parts.length === 1)
            return globals[name];
        else {
            parts.splice(0, 1);
            return this.loadClass(globals[name], parts.join("."));
        }
    }
}