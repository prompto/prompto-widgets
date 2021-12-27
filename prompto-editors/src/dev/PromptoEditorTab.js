import React from 'react';
import AcePromptoEditor from "../AcePromptoEditor";

export default class PromptoEditorTab extends React.Component {

    render() {
        return <div style={{width: "600px", height: "400px"}}>
            <AcePromptoEditor ref="AcePromptoEditor" useWorker={false}/>
        </div>;
    }
}
