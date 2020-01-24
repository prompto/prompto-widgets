import React from 'react';
import Dropzone from 'react-dropzone';

class Preview extends React.Component {

    constructor(props) {
        super(props);
        this.files = []; // needed by dropzone
    }

    click() {
        // TODO open file dialog
    }

    render() {
        const preview = this.props.preview || ( this.props.source && this.props.source.url ) ;
        const state = preview ? "PREVIEW" : this.props.dragging ? "ACTIVE" : "READY";
        return  <div style={this.props.style}>
            { state==="PREVIEW" && <img src={preview} style={{ maxWidth: "98%", maxHeight: "98%", width: "auto", height: "auto" }} alt={""}/> }
            { state==="ACTIVE" && ( this.props.dragLabel || 'Release to drop') }
            { state==="READY" && ( this.props.readyLabel || 'Drag file here' ) }
        </div>;
    }
}

export default class DroppedFileWidget extends React.Component {

    constructor(props) {
        super(props);
        this.state = { file: null, preview: null, dragging: false };
    }

    componentWillUnmount() {
        if(this.state.preview)
            URL.revokeObjectURL(this.state.preview);
    }

    onDrop(files) {
        const file = files[0];
        if(file) {
            if(typeof(FileRef)==='undefined') {
                window.FileRef = function (file) {
                    this.file = file;
                    return this
                };
            }
            this.setState({file: file, preview: URL.createObjectURL(file)}, () => {
                if(this.props.onDrop)
                    this.props.onDrop(new window.FileRef(file))
            });
        }
    }

    onDragEnter(event) {
        const hasImage = this.hasImage(event);
        this.setState({dragging: hasImage});
    }

    hasImage(event) {
        const items = event.dataTransfer.items;
        for(let i=0; i < items.length; i++) {
            const item = items[i];
            if(item.kind==="file" && item.type.startsWith("image/"))
            return true;
        }
        return false;
    }

    onDragLeave(event) {
        this.setState({dragging: false});
    }

   render() {
        return <Dropzone accept={"image/*"} onDrop={this.onDrop.bind(this)} onDragEnter={this.onDragEnter.bind(this)} onDragLeave={this.onDragLeave.bind(this)}>
            {({getRootProps, getInputProps}) =>
                <section className="container" style={{minWidth: "100px", minHeight: "100px"}}>
                    <div {...getRootProps({className: 'dropzone'})}>
                        <Preview {...getInputProps({preview: this.state.preview,
                                                    source: this.props.image,
                                                    dragging: this.state.dragging,
                                                    style: this.props.style,
                                                    dragLabel: this.props.dragLabel,
                                                    readyLabel: this.props.readyLabel })} />
                    </div>
                </section>
            }
        </Dropzone>;
    }

};