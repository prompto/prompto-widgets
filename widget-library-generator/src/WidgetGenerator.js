import PropertyConverter from "./PropertyConverter.js";

const template =
`native widget $promptoName$ {

    category bindings {
        JavaScript: $nativeName$;
    }
    
    Html method render () {
        JavaScript: return this.render();
    }

}
`;

class ConvertedProps {

    constructor(names) {
        this.names = names;
        this.props = new Map();
    }

    set(name, prop) {
        this.props.set(name, prop);
    }

    toString() {
        return "{ " + this.names.map(name => {
            const prop = this.props.get(name);
            return this.nameToString(name) + ": " + (prop ? prop.toString({}) : "null");
        }, this).join(", ") + " }";
    }

    nameToString(name) {
        if(name.indexOf("-")<0)
            return name;
        else
            return '"' + name + '"';
    }
}


export default class WidgetGenerator {

    constructor(nativeName, klass, helpers) {
        this.nativeName = nativeName;
         this.klass = klass;
        this.helpers = helpers;
    }

    generate(promptoName, nativeName) {
        const convertedProps = this.convertProps();
        const annotation = convertedProps ? "@WidgetProperties(" + convertedProps.toString() + ")\n" : "";
        return annotation + template.replace("$promptoName$", promptoName)
                                    .replace("$nativeName$", nativeName);
    }

    convertProps() {
        const missing = this.helpers["%MISSING%"];
        if(!this.klass.propTypes && !missing)
            return null;
        const converter = new PropertyConverter(this.klass, this.helpers);
        const namesFromKlass = this.klass.propTypes ? Object.getOwnPropertyNames(this.klass.propTypes).filter(name => !name.startsWith("_")) : [];
        const namesFromHelpers = missing ? Object.getOwnPropertyNames(missing) : [];
        const names = namesFromKlass.concat(namesFromHelpers).sort(); // sort to make tests predictable
        const props = new ConvertedProps(names);
        namesFromKlass.forEach(name => {
            const prop = converter.convertOne(name);
            if(prop)
                props.set(name, prop);
            else
                console.error("Could not convert property: " + name + " of widget " + this.nativeName);
        });
        namesFromHelpers.forEach(name => props.set(name,  missing[name]()));
        return props;
    }
}