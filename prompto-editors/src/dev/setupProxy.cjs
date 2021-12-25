const proxy = require('http-proxy-middleware');

module.exports = function(app) {
    app.use("/ws", proxy('http://localhost:8080/ws'));
    app.use("/js/lib", proxy('http://localhost:8080/js/lib'));
    app.use("/stub", proxy('http://localhost:8080/stub'));
};

