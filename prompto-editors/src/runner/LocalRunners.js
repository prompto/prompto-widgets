import LocalInterpreter from './LocalInterpreter';
import LocalExecutor from './LocalExecutor';

export default class Runners {

    static types = {
        LI: LocalInterpreter,
        LE: LocalExecutor
    };

    static forMode(mode) {
        const type = Runners.types[mode];
        return type ? new type() : null;
    }


}
