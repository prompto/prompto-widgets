!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t(require("React")):"function"==typeof define&&define.amd?define(["React"],t):"object"==typeof exports?exports.DroppedFileWidget=t(require("React")):e.DroppedFileWidget=t(e.React)}(window,(function(e){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=5)}([function(t,r){t.exports=e},function(e,t,r){e.exports=r(3)()},function(e,t){e.exports=function(e){function t(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var r={};return t.m=e,t.c=r,t.d=function(e,r,n){t.o(e,r)||Object.defineProperty(e,r,{configurable:!1,enumerable:!0,get:n})},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t,r){"use strict";t.__esModule=!0,t.default=function(e,t){if(e&&t){var r=Array.isArray(t)?t:t.split(","),n=e.name||"",o=e.type||"",i=o.replace(/\/.*$/,"");return r.some((function(e){var t=e.trim();return"."===t.charAt(0)?n.toLowerCase().endsWith(t.toLowerCase()):t.endsWith("/*")?i===t.replace(/\/.*$/,""):o===t}))}return!0}}])},function(e,t,r){"use strict";var n=r(4);function o(){}function i(){}i.resetWarningCache=o,e.exports=function(){function e(e,t,r,o,i,a){if(a!==n){var u=new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");throw u.name="Invariant Violation",u}}function t(){return e}e.isRequired=e;var r={array:e,bool:e,func:e,number:e,object:e,string:e,symbol:e,any:e,arrayOf:t,element:e,elementType:e,instanceOf:t,node:e,objectOf:t,oneOf:t,oneOfType:t,shape:t,exact:t,checkPropTypes:i,resetWarningCache:o};return r.PropTypes=r,r}},function(e,t,r){"use strict";e.exports="SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"},function(e,t,r){"use strict";r.r(t);var n=r(0),o=r.n(n),i=r(1),a=r.n(i);function u(e,t,r,n){return new(r||(r=Promise))((function(o,i){function a(e){try{c(n.next(e))}catch(e){i(e)}}function u(e){try{c(n.throw(e))}catch(e){i(e)}}function c(e){e.done?o(e.value):new r((function(t){t(e.value)})).then(a,u)}c((n=n.apply(e,t||[])).next())}))}function c(e,t){var r,n,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function u(i){return function(u){return function(i){if(r)throw new TypeError("Generator is already executing.");for(;a;)try{if(r=1,n&&(o=2&i[0]?n.return:i[0]?n.throw||((o=n.return)&&o.call(n),0):n.next)&&!(o=o.call(n,i[1])).done)return o;switch(n=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,n=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!(o=(o=a.trys).length>0&&o[o.length-1])&&(6===i[0]||2===i[0])){a=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){a.label=i[1];break}if(6===i[0]&&a.label<o[1]){a.label=o[1],o=i;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(i);break}o[2]&&a.ops.pop(),a.trys.pop();continue}i=t.call(e,a)}catch(e){i=[6,e],n=0}finally{r=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,u])}}}function l(e,t){var r="function"==typeof Symbol&&e[Symbol.iterator];if(!r)return e;var n,o,i=r.call(e),a=[];try{for(;(void 0===t||t-- >0)&&!(n=i.next()).done;)a.push(n.value)}catch(e){o={error:e}}finally{try{n&&!n.done&&(r=i.return)&&r.call(i)}finally{if(o)throw o.error}}return a}var s=new Map([["avi","video/avi"],["gif","image/gif"],["ico","image/x-icon"],["jpeg","image/jpeg"],["jpg","image/jpeg"],["mkv","video/x-matroska"],["mov","video/quicktime"],["mp4","video/mp4"],["pdf","application/pdf"],["png","image/png"],["zip","application/zip"],["doc","application/msword"],["docx","application/vnd.openxmlformats-officedocument.wordprocessingml.document"]]);function f(e,t){var r=function(e){var t=e.name;if(t&&-1!==t.lastIndexOf(".")&&!e.type){var r=t.split(".").pop().toLowerCase(),n=s.get(r);n&&Object.defineProperty(e,"type",{value:n,writable:!1,configurable:!1,enumerable:!0})}return e}(e);if("string"!=typeof r.path){var n=e.webkitRelativePath;Object.defineProperty(r,"path",{value:"string"==typeof t?t:"string"==typeof n&&n.length>0?n:e.name,writable:!1,configurable:!1,enumerable:!0})}return r}var p=[".DS_Store","Thumbs.db"];function d(e){return u(this,void 0,void 0,(function(){return c(this,(function(t){return[2,(r=e,r.dataTransfer&&e.dataTransfer?v(e.dataTransfer,e.type):g(e))];var r}))}))}function g(e){return(null!==e.target&&e.target.files?b(e.target.files):[]).map((function(e){return f(e)}))}function v(e,t){return u(this,void 0,void 0,(function(){var r;return c(this,(function(n){switch(n.label){case 0:return e.items?(r=b(e.items).filter((function(e){return"file"===e.kind})),"drop"!==t?[2,r]:[4,Promise.all(r.map(h))]):[3,2];case 1:return[2,y(m(n.sent()))];case 2:return[2,y(b(e.files).map((function(e){return f(e)})))]}}))}))}function y(e){return e.filter((function(e){return-1===p.indexOf(e.name)}))}function b(e){for(var t=[],r=0;r<e.length;r++){var n=e[r];t.push(n)}return t}function h(e){if("function"!=typeof e.webkitGetAsEntry)return O(e);var t=e.webkitGetAsEntry();return t&&t.isDirectory?w(t):O(e)}function m(e){return e.reduce((function(e,t){return function(){for(var e=[],t=0;t<arguments.length;t++)e=e.concat(l(arguments[t]));return e}(e,Array.isArray(t)?m(t):[t])}),[])}function O(e){var t=e.getAsFile();if(!t)return Promise.reject(e+" is not a File");var r=f(t);return Promise.resolve(r)}function D(e){return u(this,void 0,void 0,(function(){return c(this,(function(t){return[2,e.isDirectory?w(e):j(e)]}))}))}function w(e){var t=e.createReader();return new Promise((function(e,r){var n=[];!function o(){var i=this;t.readEntries((function(t){return u(i,void 0,void 0,(function(){var i,a,u;return c(this,(function(c){switch(c.label){case 0:if(t.length)return[3,5];c.label=1;case 1:return c.trys.push([1,3,,4]),[4,Promise.all(n)];case 2:return i=c.sent(),e(i),[3,4];case 3:return a=c.sent(),r(a),[3,4];case 4:return[3,6];case 5:u=Promise.all(t.map(D)),n.push(u),o(),c.label=6;case 6:return[2]}}))}))}),(function(e){r(e)}))}()}))}function j(e){return u(this,void 0,void 0,(function(){return c(this,(function(t){return[2,new Promise((function(t,r){e.file((function(r){var n=f(r,e.fullPath);t(n)}),(function(e){r(e)}))}))]}))}))}var P=r(2),E=r.n(P);function k(e,t){return"application/x-moz-file"===e.type||E()(e,t)}function F(e,t,r){if(x(e.size)){if(x(t)&&x(r))return e.size>=t&&e.size<=r;if(x(t))return e.size>=t;if(x(r))return e.size<=r}return!0}function x(e){return null!=e}function S(e,t,r,n){return e.every((function(e){return k(e,t)&&F(e,r,n)}))}function A(e){return"function"==typeof e.isPropagationStopped?e.isPropagationStopped():void 0!==e.cancelBubble&&e.cancelBubble}function C(e){return e.dataTransfer?Array.prototype.some.call(e.dataTransfer.types,(function(e){return"Files"===e||"application/x-moz-file"===e})):!!e.target&&!!e.target.files}function R(e){e.preventDefault()}function T(e){return-1!==e.indexOf("MSIE")||-1!==e.indexOf("Trident/")}function L(e){return-1!==e.indexOf("Edge/")}function _(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:window.navigator.userAgent;return T(e)||L(e)}function I(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];return function(e){for(var r=arguments.length,n=new Array(r>1?r-1:0),o=1;o<r;o++)n[o-1]=arguments[o];return t.some((function(t){return!A(e)&&t&&t.apply(void 0,[e].concat(n)),A(e)}))}}function z(e){return function(e){if(Array.isArray(e)){for(var t=0,r=new Array(e.length);t<e.length;t++)r[t]=e[t];return r}}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function W(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if(!(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e)))return;var r=[],n=!0,o=!1,i=void 0;try{for(var a,u=e[Symbol.iterator]();!(n=(a=u.next()).done)&&(r.push(a.value),!t||r.length!==t);n=!0);}catch(e){o=!0,i=e}finally{try{n||null==u.return||u.return()}finally{if(o)throw i}}return r}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}function M(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function K(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?M(r,!0).forEach((function(t){B(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):M(r).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function B(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function q(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var U=Object(n.forwardRef)((function(e,t){var r=e.children,i=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.accept,r=e.disabled,o=void 0!==r&&r,i=e.getFilesFromEvent,a=void 0===i?d:i,u=e.maxSize,c=void 0===u?1/0:u,l=e.minSize,s=void 0===l?0:l,f=e.multiple,p=void 0===f||f,g=e.onDragEnter,v=e.onDragLeave,y=e.onDragOver,b=e.onDrop,h=e.onDropAccepted,m=e.onDropRejected,O=e.onFileDialogCancel,D=e.preventDropOnDocument,w=void 0===D||D,j=e.noClick,P=void 0!==j&&j,E=e.noKeyboard,x=void 0!==E&&E,T=e.noDrag,L=void 0!==T&&T,M=e.noDragEventsBubbling,U=void 0!==M&&M,V=Object(n.useRef)(null),G=Object(n.useRef)(null),Y=Object(n.useReducer)(N,H),$=W(Y,2),J=$[0],Q=$[1],X=J.isFocused,Z=J.isFileDialogActive,ee=J.draggedFiles,te=Object(n.useCallback)((function(){G.current&&(Q({type:"openDialog"}),G.current.value=null,G.current.click())}),[Q]),re=function(){Z&&setTimeout((function(){G.current&&(G.current.files.length||(Q({type:"closeDialog"}),"function"==typeof O&&O()))}),300)};Object(n.useEffect)((function(){return window.addEventListener("focus",re,!1),function(){window.removeEventListener("focus",re,!1)}}),[G,Z,O]);var ne=Object(n.useCallback)((function(e){V.current&&V.current.isEqualNode(e.target)&&(32!==e.keyCode&&13!==e.keyCode||(e.preventDefault(),te()))}),[V,G]),oe=Object(n.useCallback)((function(){Q({type:"focus"})}),[]),ie=Object(n.useCallback)((function(){Q({type:"blur"})}),[]),ae=Object(n.useCallback)((function(){P||(_()?setTimeout(te,0):te())}),[G,P]),ue=Object(n.useRef)([]),ce=function(e){V.current&&V.current.contains(e.target)||(e.preventDefault(),ue.current=[])};Object(n.useEffect)((function(){return w&&(document.addEventListener("dragover",R,!1),document.addEventListener("drop",ce,!1)),function(){w&&(document.removeEventListener("dragover",R),document.removeEventListener("drop",ce))}}),[V,w]);var le=Object(n.useCallback)((function(e){e.preventDefault(),e.persist(),ye(e),-1===ue.current.indexOf(e.target)&&(ue.current=[].concat(z(ue.current),[e.target])),C(e)&&Promise.resolve(a(e)).then((function(t){A(e)&&!U||(Q({draggedFiles:t,isDragActive:!0,type:"setDraggedFiles"}),g&&g(e))}))}),[a,g,U]),se=Object(n.useCallback)((function(e){if(e.preventDefault(),e.persist(),ye(e),e.dataTransfer)try{e.dataTransfer.dropEffect="copy"}catch(e){}return C(e)&&y&&y(e),!1}),[y,U]),fe=Object(n.useCallback)((function(e){e.preventDefault(),e.persist(),ye(e);var t=ue.current.filter((function(t){return t!==e.target&&V.current&&V.current.contains(t)}));ue.current=t,t.length>0||(Q({isDragActive:!1,type:"setDraggedFiles",draggedFiles:[]}),C(e)&&v&&v(e))}),[V,v,U]),pe=Object(n.useCallback)((function(e){e.preventDefault(),e.persist(),ye(e),ue.current=[],Q({type:"reset"}),C(e)&&Promise.resolve(a(e)).then((function(r){if(!A(e)||U){var n=[],o=[];r.forEach((function(e){k(e,t)&&F(e,s,c)?n.push(e):o.push(e)})),!p&&n.length>1&&o.push.apply(o,z(n.splice(0))),Q({acceptedFiles:n,rejectedFiles:o,type:"setFiles"}),b&&b(n,o,e),o.length>0&&m&&m(o,e),n.length>0&&h&&h(n,e)}}))}),[p,t,s,c,a,b,h,m,U]),de=function(e){return o?null:e},ge=function(e){return x?null:de(e)},ve=function(e){return L?null:de(e)},ye=function(e){U&&e.stopPropagation()},be=Object(n.useMemo)((function(){return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.refKey,r=void 0===t?"ref":t,n=e.onKeyDown,i=e.onFocus,a=e.onBlur,u=e.onClick,c=e.onDragEnter,l=e.onDragOver,s=e.onDragLeave,f=e.onDrop,p=q(e,["refKey","onKeyDown","onFocus","onBlur","onClick","onDragEnter","onDragOver","onDragLeave","onDrop"]);return K(B({onKeyDown:ge(I(n,ne)),onFocus:ge(I(i,oe)),onBlur:ge(I(a,ie)),onClick:de(I(u,ae)),onDragEnter:ve(I(c,le)),onDragOver:ve(I(l,se)),onDragLeave:ve(I(s,fe)),onDrop:ve(I(f,pe))},r,V),o||x?{}:{tabIndex:0},{},p)}}),[V,ne,oe,ie,ae,le,se,fe,pe,x,L,o]),he=Object(n.useCallback)((function(e){e.stopPropagation()}),[]),me=Object(n.useMemo)((function(){return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=e.refKey,n=void 0===r?"ref":r,o=e.onChange,i=e.onClick,a=q(e,["refKey","onChange","onClick"]),u=B({accept:t,multiple:p,type:"file",style:{display:"none"},onChange:de(I(o,pe)),onClick:de(I(i,he)),autoComplete:"off",tabIndex:-1},n,G);return K({},u,{},a)}}),[G,t,p,pe,o]),Oe=ee.length,De=p||Oe<=1,we=Oe>0&&S(ee,t,s,c),je=Oe>0&&(!we||!De);return K({},J,{isDragAccept:we,isDragReject:je,isFocused:X&&!o,getRootProps:be,getInputProps:me,rootRef:V,inputRef:G,open:de(te)})}(q(e,["children"])),a=i.open,u=q(i,["open"]);return Object(n.useImperativeHandle)(t,(function(){return{open:a}}),[a]),o.a.createElement(n.Fragment,null,r(K({},u,{open:a})))}));U.displayName="Dropzone",U.propTypes={children:a.a.func,accept:a.a.oneOfType([a.a.string,a.a.arrayOf(a.a.string)]),multiple:a.a.bool,preventDropOnDocument:a.a.bool,noClick:a.a.bool,noKeyboard:a.a.bool,noDrag:a.a.bool,noDragEventsBubbling:a.a.bool,minSize:a.a.number,maxSize:a.a.number,disabled:a.a.bool,getFilesFromEvent:a.a.func,onFileDialogCancel:a.a.func,onDragEnter:a.a.func,onDragLeave:a.a.func,onDragOver:a.a.func,onDrop:a.a.func,onDropAccepted:a.a.func,onDropRejected:a.a.func};var V=U,H={isFocused:!1,isFileDialogActive:!1,isDragActive:!1,isDragAccept:!1,isDragReject:!1,draggedFiles:[],acceptedFiles:[],rejectedFiles:[]};function N(e,t){switch(t.type){case"focus":return K({},e,{isFocused:!0});case"blur":return K({},e,{isFocused:!1});case"openDialog":return K({},e,{isFileDialogActive:!0});case"closeDialog":return K({},e,{isFileDialogActive:!1});case"setDraggedFiles":var r=t.isDragActive;return K({},e,{draggedFiles:t.draggedFiles,isDragActive:r});case"setFiles":return K({},e,{acceptedFiles:t.acceptedFiles,rejectedFiles:t.rejectedFiles});case"reset":return K({},e,{isFileDialogActive:!1,isDragActive:!1,draggedFiles:[]});default:return e}}function G(e){return(G="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function Y(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function $(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function J(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function Q(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function X(e,t,r){return t&&Q(e.prototype,t),r&&Q(e,r),e}function Z(e,t){return!t||"object"!==G(t)&&"function"!=typeof t?ee(e):t}function ee(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function te(e){return(te=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function re(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&ne(e,t)}function ne(e,t){return(ne=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}r.d(t,"default",(function(){return ae}));var oe=null;var ie=function(e){function t(e){var r;return J(this,t),(r=Z(this,te(t).call(this,e))).files=[],r.input=null,r}return re(t,e),X(t,[{key:"click",value:function(){this.input.click()}},{key:"render",value:function(){var e=this,t=this.props.preview||this.props.current&&this.props.current.url,r=t?"PREVIEW":this.props.dragging?"ACTIVE":"READY",n=function(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?Y(Object(r),!0).forEach((function(t){$(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):Y(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}({},this.props.style,{backgroundColor:this.props.dragging?"Highlight":"white"});return o.a.createElement("div",{style:n},"PREVIEW"===r&&o.a.createElement("img",{src:t,style:{maxWidth:"98%",maxHeight:"98%",width:"auto",height:"auto"},alt:""}),"ACTIVE"===r&&(this.props.dragLabel||"Release to drop"),"READY"===r&&(this.props.readyLabel||"Drag file here"),o.a.createElement("input",{type:"file",ref:function(t){return e.input=t},onChange:this.props.onChange,style:{display:"none"}}))}}]),t}(o.a.Component),ae=function(e){function t(e){var r;return J(this,t),(r=Z(this,te(t).call(this,e))).state={file:null,preview:null,dragging:!1},r.clear=r.clear.bind(ee(r)),r}return re(t,e),X(t,[{key:"componentWillUnmount",value:function(){this.state.preview&&URL.revokeObjectURL(this.state.preview)}},{key:"clear",value:function(){this.setState({file:null,preview:null,dragging:!1})}},{key:"onDrop",value:function(e){var t=this;this.setState({dragging:!1});var r=e[0];if(r){var n=function(){if(oe)return oe;if(window.FileRef)oe=window.FileRef;else if(window.require)try{var e=window.require("/prompto/internet/FileRef.js",null,null,(function(e){return{id:e,uri:e}}));oe=e.FileRef}catch(e){}return oe||(oe=function(e){return this.file=e,this}),oe}();this.setState({file:r,preview:URL.createObjectURL(r)},(function(){t.props.onDrop&&t.props.onDrop(new n(r))}))}}},{key:"onDragEnter",value:function(e){var t=this.props.acceptAll?this.hasFile(e):this.hasImage(e);this.setState({dragging:t})}},{key:"hasFile",value:function(e){return e.dataTransfer.items.length>0}},{key:"hasImage",value:function(e){for(var t=e.dataTransfer.items,r=0;r<t.length;r++){var n=t[r];if("file"===n.kind&&n.type.startsWith("image/"))return!0}return!1}},{key:"onDragLeave",value:function(e){this.setState({dragging:!1})}},{key:"render",value:function(){var e=this;return o.a.createElement(V,{onDrop:this.onDrop.bind(this),onDragEnter:this.onDragEnter.bind(this),onDragLeave:this.onDragLeave.bind(this)},(function(t){var r=t.getRootProps,n=t.getInputProps;return o.a.createElement("div",r({className:"dropzone"}),o.a.createElement(ie,n({preview:e.state.preview,current:e.props.preview,dragging:e.state.dragging,style:e.props.style,dragLabel:e.props.dragLabel,readyLabel:e.props.readyLabel})))}))}}]),t}(o.a.Component)}])}));