import React from 'react';
import DroppedFileWidget from "./DroppedFileWidget";
import Image from "./Image";

const style = {
    display: 'inline-flex',
    border: '1px solid gray',
    height: '300px',
    width: '300px',
    padding: '20px',
    alignItems: 'center',
    justifyContent: 'center'
};

export default class DroppedFilePage extends React.Component {

    constructor(props) {
        super(props);
        const image = Image.fromJSON({ mimeType: "image/png", url: "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png" });
        this.state = { image: image };
    }

    render() {
        return <DroppedFileWidget image={this.state.image} onDrop={this.onDrop.bind(this)} style={style} dragLabel={"Yep!"}></DroppedFileWidget>;
    }

    onDrop(file) {
        const image = Image.fromFile(file.file);
        this.setState({ image: image });
    }
}