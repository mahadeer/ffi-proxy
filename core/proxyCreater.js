var ffi = require("ffi");
var path = require("path");

function ExtractProxyInfo(ffiConfig) {
    return ffiConfig.addons.map(function(addon) {
        var addonName = addon.alias || addon.name;
        var proxies = Object.keys(addon.proxy).map(function(proxyKey) {
            var proxy = addon.proxy[proxyKey];
            if(Array.isArray(proxy)) {
                proxy = {
                    alias: proxyKey,
                    signature: JSON.parse(JSON.stringify(proxy))
                };
            }
            return {
                key: proxyKey,
                value: proxy
            };
        });
        return {
            name: addonName,
            imports: proxies
        }
    });
}

module.exports = function(fileInfo, ffiConfig) {
    var proxies = ExtractProxyInfo(ffiConfig);
    var exports = fileInfo.map(function(info) {
        var proxy = proxies.filter(function(proxy) {
            return (proxy.name === info.name);
        });
        if(proxy.length > 0) {
            proxy = proxy[0];
            var filePath = path.resolve([info.filePath,"/", info.fileName].join(""));
            var symbolExports = proxy.imports.reduce(function(acc, sym) {
                acc[sym.key] = sym.value.signature;
                return acc;
            }, {});
            var externs = ffi.Library(filePath, symbolExports);
            return {
                name: info.name,
                module: proxy.imports.reduce(function(acc, sym) {
                    acc[sym.value.alias] = externs[sym.key];
                    return acc;
                }, {})
            }
        }
        return null;
    });
    return exports.reduce(function(acc, val) {
        acc[val.name] = val.module;
        return acc;
    }, {});
}