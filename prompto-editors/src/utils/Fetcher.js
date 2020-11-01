import axios from "axios";

// eslint-disable-next-line
const globals = self || window;

export default class Fetcher {

    constructor() {
        this.$authorization = null;
        this.onSuccess = this.onSuccess.bind(this);
        this.prepareConfig = this.prepareConfig.bind(this);
        this.collectHeaders = this.collectHeaders.bind(this);
    }

    prepareConfig(url) {
        if (url[0] !== "/" && url[0] !== ".") {
            let headers = { "Access-Control-Allow-Origin": "*" };
            if(this.$authorization !== null)
                headers =  { ...headers, "X-Authorization": this.$authorization };
            return { withCredentials: true, headers: headers};
        } else
            return {};
    }

    postJSON(url, params, success, errored) {
        this.postTEXT(url, params, text => {
            const json = typeof(text)===typeof('') ? JSON.parse(text) : text; // already transformed by axios
            success(json);
        }, errored);
    }

    postTEXT(url, params, success, errored) {
        errored = errored || console.log;
        const config = this.prepareConfig(url);
        axios.post(url, params, config)
            .then(resp => this.onSuccess(resp, url, success, errored))
            .catch(errored);
    }


    getJSON(url, params, success, errored) {
        this.getTEXT(url, params, text => {
            const json = typeof(text)===typeof('') ? JSON.parse(text) : text; // already transformed by axios
            success(json);
        }, errored);
    }

    getTEXT(url, params, success, errored) {
        errored = errored || console.log;
        let config = this.prepareConfig(url);
        if(params)
            config = { ...config, params: params};
        axios.get(url, config)
           .then(resp => this.onSuccess(resp, url, success, errored))
           .catch(errored);
    }

    onSuccess(response, url, success, errored) {
        if (response.status === 200) {
            this.collectHeaders(response, url);
            success(response.data);
        } else
            errored("Failed to load " + url + ", error: " + response.status);
    }

    collectHeaders(response, url) {
        // only read headers from server
        if (url[0] === "/" || url[0] === ".")
            this.$authorization = response.headers["X-Authorization"] || null;
    }

    clearModuleContext(projectId, success, errored) {
        const args = [ {name:"dbId", value: projectId}];
        const params = { params: JSON.stringify(args) };
        axios.get('/ws/run/clearModuleContext', { params: params })
            .then(resp => {
                const response = resp.data;
                if (response.error)
                    ; // TODO something
                else if(response.data === -1)
                    alert("Server is not running!");
                else if(success)
                    success(response.data);
            })
            .catch(error => errored ? errored(error) : {} );
    }

    fetchModulePort(projectId, action, success, errored) {
        const args = [ {name:"dbId", value: projectId}, {name:"action", type: "Text", value: action} ];
        const params = { params: JSON.stringify(args) };
        axios.get('/ws/run/fetchModulePort', { params: params })
            .then(resp => {
                const response = resp.data;
                if (response.error)
                    ; // TODO something
                else if(response.data === -1)
                    alert("Server is not running!");
                else
                    success(response.data);
            })
            .catch(error => errored(error));
    }

    fetchModuleURL(projectId, action, success, errored) {
        this.fetchModulePort(projectId, action, port => {
            const href = globals.location.protocol +
                "//" + globals.location.hostname +
                ":" + port + "/";
            success(href);
        }, errored);
    }

}

Fetcher.instance = new Fetcher(); // singleton needed to register $authorization across calls
