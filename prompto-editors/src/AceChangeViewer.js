import React from "react";
import { diff as DiffEditor, split as SplitEditor } from "react-ace";
const Diff = require("diff");

class SplitViewer extends SplitEditor {

    render() {
        return <>
            { super.render() }
            { this.renderChanges()}
            </>;
    }

    renderChanges() {
        return null;
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
            className={this.props.className}
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
        return <div style={style} >
                    <ChangeViewer ref="ChangeViewer" name="change-viewer"
                       theme="eclipse" mode="text"
                       value={[this.props.currentVersion, this.props.proposedVersion]}
                       /* onChange={this.bodyEdited.bind(this)} */
                       width="100%" height="100%" editorProps={{ $blockScrolling: Infinity }}  />
        </div>;
    }

}
