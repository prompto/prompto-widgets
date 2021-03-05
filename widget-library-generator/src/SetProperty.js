export default class SetProperty {

    constructor(values) {
        this.values = values;
    }

    mustAppendNull(options) {
        if(this.values.indexOf(null) >= 0)
            return false;
        else if(!options)
            return true;
        else
            return !(!!options.required || !!options.asElement);
    }

}