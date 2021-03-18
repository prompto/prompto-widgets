import DatePicker from './src/datepicker/DatePicker';
import PromptoTypeahead from './src/typeahead/PromptoTypeahead';
import ContextMenu from './src/contextmenu/ContextMenu';

export const ReactBootstrapExtras = {
    ContextMenu: ContextMenu,
    DatePicker: DatePicker,
    Typeahead: PromptoTypeahead
}

// noinspection JSUnresolvedVariable
ReactBootstrap = Object.assign(ReactBootstrap , ReactBootstrapExtras);
