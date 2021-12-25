import React from 'react';

import { Tabs, Tab } from 'react-bootstrap';
import ResourceEditorTab from "./ResourceEditorTab";
import PromptoEditorTab from "./PromptoEditorTab";
import ChangeViewerTab from "./ChangeViewerTab";

export default class ResourceEditorPage extends React.Component {

    render() {
        return <Tabs defaultActiveKey="resource">
            <Tab eventKey="resource" title="Resource editor">
                <ResourceEditorTab />
            </Tab>
            <Tab eventKey="prompto" title="Prompto editor">
                <PromptoEditorTab />
            </Tab>
            <Tab eventKey="change" title="Change viewer">
                <ChangeViewerTab />
            </Tab>
        </Tabs>
    }
}
