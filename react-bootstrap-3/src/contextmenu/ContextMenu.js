import React from 'react';
import { Clearfix } from 'react-bootstrap';

export default class ContextMenu extends React.Component {

    render() {
        return <Clearfix>
                <ul className="dropdown-menu" style={{display: "block"}}>
                    { this.props.children }
                </ul>
            </Clearfix>;
    }
}