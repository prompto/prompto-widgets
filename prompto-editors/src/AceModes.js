import PromptoMode from "./mode/PromptoMode";

const MIME_TYPE_MODE_ID = {
    "page" : "yaml",
    "plain" : "text",
    "babel" : "jsx"
};

export function modeFromMimeType(mimeType, editor, useWorker) {
    if (mimeType) {
        if(mimeType.startsWith("text/")) {
            const textType = mimeType.split("/")[1];
            return "ace/mode/" + (MIME_TYPE_MODE_ID[textType] || textType);
        } else if(mimeType.startsWith("prompto/")) {
            const dialect = mimeType.split("/")[1][0].toUpperCase();
            return new PromptoMode(editor, dialect, useWorker);
        }
    }
    return null;
}
