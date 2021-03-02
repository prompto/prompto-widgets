import PropertyConverter from "./PropertyConverter";

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
            return name + ": " + (prop ? prop.toString() : "null");
        }).join(", ") + " }";
    }
}


export default class WidgetGenerator {

    constructor(klass, helpers) {
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
        if(!this.klass.propTypes)
            return null;
        const converter = new PropertyConverter(this.klass, this.helpers);
        const names = Object.getOwnPropertyNames(this.klass.propTypes).sort(); // sort to make it predictable
        const props = new ConvertedProps(names);
        names.forEach(name => props.set(name, converter.convertOne(name)));
        return props;
    }
}