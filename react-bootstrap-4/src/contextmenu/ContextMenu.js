import React from 'react';

export default class ContextMenu extends React.Component {

    render() {
        return <div className="clearfix">
            <ul className="dropdown-menu" style={{display: "block"}}>
                { this.props.children }
            </ul>
        </div>;
    }
}