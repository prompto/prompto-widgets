import React, { useRef, useEffect } from "react";
import { diff as DiffEditor, split as SplitEditor } from "react-ace";
import {modeFromMimeType} from "./AceModes";
import PropTypes from "prop-types";
import ChangeBuilder from "./change/ChangeBuilder";

const Canvas = props => {

    const canvasRef = useRef(null);

    const topOfLine = (editor, line) => {
        return ((line - 1) * editor.renderer.lineHeight) - editor.renderer.scrollTop;
    };

    const bottomOfLine = (editor, line) => {
        return ((line * editor.renderer.lineHeight) + 1) - editor.renderer.scrollTop;
    }

    const rectOfEditor = (editor) => {
        const rects = editor.container.getClientRects();
        if(rects.length === 0)
            return { x: 0, y: 0, width: 100, height: 100};
        const parentRects = editor.container.parentNode.getClientRects();
        return { x: rects[0].x - parentRects[0].x, y: rects[0].y - parentRects[0].y, width: rects[0].width, height: rects[0].height};
    }

    const leftOfEditor = (editor) => {
        const rect = rectOfEditor(editor);
        return rect.x + editor.renderer.$gutter.offsetWidth;
    }

    const rightOfEditor = (editor) => {
        const rect = rectOfEditor(editor);
        return rect.x + rect.width;
    }

    const computePoints = (change) => {
        const left = props.editor.split.$editors[0];
        const right = props.editor.split.$editors[1];
        const points = [];
        points.push({ x: 0, y: topOfLine(left, change.left.line) });
        points.push({ x: rightOfEditor(left), y: topOfLine(left, change.left.line) });
        points.push({ x: leftOfEditor(right), y: topOfLine(right, change.right.line) });
        points.push({ x: rightOfEditor(right), y: topOfLine(right, change.right.line) });
        points.push({ x: rightOfEditor(right), y: bottomOfLine(right, change.right.line + change.right.count - 1) });
        points.push({ x: leftOfEditor(right), y: bottomOfLine(right, change.right.line + change.right.count - 1) });
        points.push({ x: rightOfEditor(left), y: bottomOfLine(left, change.left.line + change.left.count - 1) });
        points.push({ x: 0, y: bottomOfLine(left, change.left.line + change.left.count - 1) });
        return points
    };

    const drawChange = (ctx, change) => {
        ctx.fillStyle = change.left.count === 0 ? '#00800020' : change.right.count === 0 ? '#80000020' : '#FFBB0030';
        const points = computePoints(change);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.bezierCurveTo((points[1].x + points[2].x) / 2, points[1].y, (points[1].x + points[2].x) / 2, points[2].y, points[2].x, points[2].y);
        ctx.lineTo(points[3].x, points[3].y);
        ctx.lineTo(points[4].x, points[4].y);
        ctx.lineTo(points[5].x, points[5].y);
        ctx.bezierCurveTo((points[6].x + points[5].x) / 2, points[5].y, (points[5].x + points[6].x) / 2, points[6].y, points[6].x, points[6].y);
        ctx.lineTo(points[7].x, points[7].y);
        ctx.closePath();
        ctx.fill();
    };

    const draw = ctx => {
        props.changes.forEach( c => drawChange( ctx, c));
    }

    useEffect(() => {
       const canvas = canvasRef.current;
       canvas.width = canvas.offsetWidth;
       canvas.height = canvas.offsetHeight;
       const context = canvas.getContext('2d')
       draw(context)
    }, [draw]);

    return <canvas ref={canvasRef} {...props} style={{position: "absolute", top: "0px", width: "100%", height: "100%", zIndex: 10, pointerEvents: "none"}}/>;
};

class SplitViewer extends SplitEditor {

    render() {
        return <>
                { super.render() }
                <Canvas changes={this.props.changes} editor={this} />
            </>;
    }

    setMode(mode) {
        this.editor.getSession().setMode(mode);
        this.split.$editors.forEach(editor => editor.getSession().setMode(mode));
    }
}

class ChangeViewer extends DiffEditor {

    static propTypes = {...DiffEditor.propTypes, mode: PropTypes.oneOfType([PropTypes.string, PropTypes.any]) };

    render() {
        if(!this.SplitViewer) {
            this.SplitViewer = React.createRef();
        }
        const changes = ChangeBuilder.computeChanges(this.props.value[0], this.props.value[1]);
        let mode = this.props.mode;
        if(typeof(mode) === typeof("")) {
            this.modeToSet = null;
            if (mode.startsWith("ace/mode/"))
                mode = mode.substring(9);
        } else {
            this.modeToSet = mode;
            mode = "text";
        }
        return <SplitViewer
            ref={this.SplitViewer}
            name={this.props.name}
            className="change-viewer"
            focus={this.props.focus}
            orientation={this.props.orientation}
            splits={this.props.splits}
            mode={mode}
            theme={this.props.theme}
            height={this.props.height}
            width={this.props.width}
            fontSize={this.props.fontSize}
            showGutter={this.props.showGutter}
            onChange={this.onChange}
            onPaste={this.props.onPaste}
            onLoad={this.props.onLoad}
            onScroll={this.onScroll.bind(this)}
            minLines={this.props.minLines}
            maxLines={this.props.maxLines}
            readOnly={this.props.readOnly}
            highlightActiveLine={this.props.highlightActiveLine}
            showPrintMargin={this.props.showPrintMargin}
            tabSize={this.props.tabSize}
            cursorStart={this.props.cursorStart}
            editorProps={this.props.editorProps}
            style={this.props.style}
            scrollMargin={this.props.scrollMargin}
            setOptions={this.props.setOptions}
            wrapEnabled={this.props.wrapEnabled}
            enableBasicAutocompletion={this.props.enableBasicAutocompletion}
            enableLiveAutocompletion={this.props.enableLiveAutocompletion}
            value={this.props.value}
            changes={changes}
        />
    }

    componentDidUpdate() {
        if(this.modeToSet) {
            this.SplitViewer.current.setMode(this.modeToSet);
            this.modeToSet = null;
        }
    }

    onScroll(e) {
        this.SplitViewer.current.forceUpdate();
        this.props.onScroll && this.props.onScroll(e);
    }
}


export default class AceChangeViewer extends React.Component {

    render() {
        const style = {position: "relative", width: "100%",  height: "100%" };
        const options = { highlightGutterLine: false };
        const mode = modeFromMimeType(this.props.mimeType, null, false);
        return <div style={style} >
                    <ChangeViewer ref="ChangeViewer" name="change-viewer"
                       theme="eclipse" mode={mode} highlightActiveLine={false} setOptions={options}
                       value={[this.props.currentVersion, this.props.proposedVersion]}
                       /* onChange={this.bodyEdited.bind(this)} */
                       width="100%" height="100%" editorProps={{ $blockScrolling: Infinity }}  />
            </div>;
    }

    forceResize() {
        this.refs.ChangeViewer.SplitViewer.current.split.resize(true);
        this.forceUpdate();
    }

}
