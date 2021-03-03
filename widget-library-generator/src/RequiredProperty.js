export default class RequiredProperty {

    constructor(wrapped) {
        this.wrapped = wrapped;
    }

    toString() {
        return this.wrapped.toString(true);
    }
}