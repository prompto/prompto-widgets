import React, { useRef, useEffect } from "react";
import { diff as DiffEditor, split as SplitEditor } from "react-ace";
const Diff = require("diff");

const Canvas = props => {

    const canvasRef = useRef(null);

    const topOfLine = (editor, line) => {
        return (line - 1) * editor.renderer.lineHeight;
    };

    const bottomOfLine = (editor, line) => {
        return (line * editor.renderer.lineHeight) + 1;
    }

    const leftOfEditor = (editor) => {
        return editor.container.getClientRects()[0].x + editor.renderer.$gutter.offsetWidth;
    }

    const rightOfEditor = (editor) => {
        const rect = editor.container.getClientRects()[0];
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

    return <canvas ref={canvasRef} {...props} style={{position: "absolute", width: "100%", height: "100%", zIndex: 10}}/>;
};

class SplitViewer extends SplitEditor {

    render() {
        return <>
                { super.render() }
                <Canvas changes={this.props.changes} editor={this} />
            </>;
    }

}

class ChangeViewer extends DiffEditor {

    computeDifferences(lhs, rhs) {
        return Diff.diffArrays(lhs.split("\n"), rhs.split("\n"));
    }

    mergeDifferences(diffs) {
        let leftLine = 1;
        let rightLine = 1;
        const changes = [];
        for(let i=0; i<diffs.length; i++) {
            const d1 = diffs[i];
            if(d1.removed && i+1<diffs.length) {
                const d2 = diffs[i+1];
                if(d2.added) {
                    changes.push({ left: { line: leftLine, count: d1.count }, right: { line: rightLine, count: d2.count }});
                    leftLine += d1.count;
                    rightLine += d2.count;
                    i++;
                    continue;
                }
            }
            if(d1.removed) {
                changes.push({ left: { line: leftLine, count: d1.count }, right: { line: rightLine, count: 0 }});
                leftLine += d1.count;
            } else if(d1.added) {
                changes.push({ left: { line: leftLine, count: 0 }, right: { line: rightLine, count: d1.count }});
                rightLine += d1.count;
            } else {
                leftLine += d1.count;
                rightLine += d1.count;
            }
        }
        return changes;
    }

    render() {
        const diffs = this.computeDifferences(this.state.value[0], this.state.value[1]);
        const changes = this.mergeDifferences(diffs);
        return <SplitViewer
            name={this.props.name}
            className="change-viewer"
            focus={this.props.focus}
            orientation={this.props.orientation}
            splits={this.props.splits}
            mode={this.props.mode}
            theme={this.props.theme}
            height={this.props.height}
            width={this.props.width}
            fontSize={this.props.fontSize}
            showGutter={this.props.showGutter}
            onChange={this.onChange}
            onPaste={this.props.onPaste}
            onLoad={this.props.onLoad}
            onScroll={this.props.onScroll}
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
            value={this.state.value}
            changes={changes}
        />
    }

}


export default class AceChangeViewer extends React.Component {

    render() {
        const style = {position: "relative", width: "100%",  height: "100%" };
        const options = { highlightGutterLine: false };
        return <div style={style} >
                    <ChangeViewer ref="ChangeViewer" name="change-viewer"
                       theme="eclipse" mode="text" highlightActiveLine={false} setOptions={options}
                       value={[this.props.currentVersion, this.props.proposedVersion]}
                       /* onChange={this.bodyEdited.bind(this)} */
                       width="100%" height="100%" editorProps={{ $blockScrolling: Infinity }}  />
        </div>;
    }

}
