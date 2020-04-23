import React from 'react';
import Dropzone from 'react-dropzone';

let FileRef = null;

function loadFileRef() {
    if(FileRef)
        return FileRef;
    if(window.FileRef) {
        FileRef = window.FileRef;
    } else if(window.require) {
        try {
            const module = window.require('/prompto/internet/FileRef.js', null, null, m => ({id: m, uri: m}));
            FileRef = module.FileRef;
        } catch(error) {
        }
    }
    if(!FileRef) {
        FileRef = function (file) {
            this.file = file;
            return this;
        };
    }
    return FileRef;
}

class Preview extends React.Component {

    constructor(props) {
        super(props);
        this.files = []; // needed by dropzone
        this.input = null;
    }

    click() {
        this.input.click();
    }

    render() {
        const preview = this.props.preview || ( this.props.current && this.props.current.url ) ;
        const state = preview ? "PREVIEW" : this.props.dragging ? "ACTIVE" : "READY";
        const style = { ...this.props.style, backgroundColor: this.props.dragging ? "Highlight" : "white" };
        return  <div style={style}>
            { state==="PREVIEW" && <img src={preview} style={{ maxWidth: "98%", maxHeight: "98%", width: "auto", height: "auto" }} alt={""}/> }
            { state==="ACTIVE" && ( this.props.dragLabel || 'Release to drop') }
            { state==="READY" && ( this.props.readyLabel || 'Drag file here' ) }
            <input type="file" ref={ref=>this.input=ref} onChange={this.props.onChange} style={{display: "none"}}/>
        </div>;
    }
}

export default class DroppedFileWidget extends React.Component {

    constructor(props) {
        super(props);
        this.state = { file: null, preview: null, dragging: false };
        this.clear = this.clear.bind(this);
    }

    componentWillUnmount() {
        if(this.state.preview)
            URL.revokeObjectURL(this.state.preview);
    }

    clear() {
        this.setState({ file: null, preview: null, dragging: false });
    }

    onDrop(files) {
        this.setState({dragging: false});
        const file = files[0];
        if(file) {
            const FileRef = loadFileRef();
            this.setState({file: file, preview: URL.createObjectURL(file)}, () => {
                if(this.props.onDrop)
                    this.props.onDrop(new FileRef(file))
            });
        }
    }

    onDragEnter(event) {
        const allowed = this.props.acceptAll ? this.hasFile(event) : this.hasImage(event);
        this.setState({dragging: allowed});
    }

    hasFile(event) {
        return event.dataTransfer.items.length > 0;
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
        return <Dropzone onDrop={this.onDrop.bind(this)} onDragEnter={this.onDragEnter.bind(this)} onDragLeave={this.onDragLeave.bind(this)}>
            {({getRootProps, getInputProps}) =>
                <div {...getRootProps({className: 'dropzone'})}>
                    <Preview {...getInputProps({preview: this.state.preview,
                                                current: this.props.preview,
                                                dragging: this.state.dragging,
                                                style: this.props.style,
                                                dragLabel: this.props.dragLabel,
                                                readyLabel: this.props.readyLabel })} />
                </div>
            }
        </Dropzone>;
    }

};