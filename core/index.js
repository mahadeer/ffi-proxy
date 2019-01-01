const fse = require("fs-extra");
const nrc = require("node-run-cmd");
const path = require("path");
const messages = require("../tools/messages");
const utils = require("../tools/utils");
const callerPath = path.dirname(process.argv[1]);
const CONFIG_KEY = Symbol("FFI_PROXY");
const ffiBuilder = require("ffi-builder");
const CreateProxies = require("./proxyCreater");

module.exports = (config) => {
    try {
        if (utils.isValid(config)) {
            switch (typeof config) {
                case "string":
                    // TODO for relative path
                    messages.notImplementedYet();
                    break;
                case "object":
                    break;
                default:
                    messages.invalidConfigType();
                    break;
            }
            global[CONFIG_KEY] = config;
        } else {
            var ffiConfig = path.resolve(callerPath, "./ffi-config.json");
            global[CONFIG_KEY] = require(ffiConfig);
        }
    } catch (ex) {
        messages.configNotFound();
    }
    // After config's have been set
    return new Promise((resolve, reject) => {
        try {
            ffiBuilder
                .build()
                .then((res) => {
                    return CreateProxies(res, global[CONFIG_KEY]);
                })
                .then(resolve)
        } catch (err) {
            reject(err);
        }
    });
}