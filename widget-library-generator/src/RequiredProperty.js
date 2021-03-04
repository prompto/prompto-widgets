export default class RequiredProperty {

    constructor(wrapped) {
        this.wrapped = wrapped;
    }

    toString(options) {
        return this.wrapped.toString(Object.assign({}, options, {required: true}));
    }
}