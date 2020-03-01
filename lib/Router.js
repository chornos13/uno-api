"use strict";
/*
    Author: Chornos13
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var ArgumentHelpers = require('./ArgumentHelpers');
var apis = {};
var UNOS_CONFIG = {
    title: '',
    baseURL: '',
    middleware: undefined,
    wrapperRequest: undefined
};
var CREATE_CONFIG = {
    title: '',
    baseURL: '',
    get: undefined, post: undefined, put: undefined, delete: undefined,
    getWithParam: undefined, postWithParam: undefined,
    putWithParam: undefined, deleteWithParam: undefined,
    middleware: undefined,
    overrideMiddleware: false,
    wrapperRequest: undefined
};
var METHOD_CONFIG = {
    middleware: undefined,
    callback: undefined, url: undefined,
    overrideMiddleware: false,
    wrapperRequest: undefined
};
var allowedMethod = ['get', 'post', 'put', 'delete'];
function cloneObj(obj) {
    return Object.assign({}, obj);
}
function cloneArray(arr) {
    return arr.slice(0);
}
function getMiddleware(unosApi, createConfigs, cfgMethod) {
    var priorityConfig = [cfgMethod, createConfigs, unosApi.configs];
    var curMiddleware = [];
    for (var i = 0; i < priorityConfig.length; i++) {
        var config = cloneObj(priorityConfig[i]);
        var middleware = ArgumentHelpers.getSingleArray(config.middleware, true);
        curMiddleware.splice.apply(curMiddleware, __spreadArrays([0, 0], middleware));
        if (config.overrideMiddleware) {
            break;
        }
    }
    return curMiddleware;
}
function grabCallbackFromArray(arrCallback) {
    var overrideMiddleware = false;
    var callback = arrCallback.pop();
    if (callback === true) {
        overrideMiddleware = true;
        callback = arrCallback.pop();
    }
    return {
        overrideMiddleware: overrideMiddleware,
        callback: callback
    };
}
var ConfigureApi = function (unosApi, createConfigs, method, withParam) {
    if (withParam === void 0) { withParam = false; }
    //adding method only when function is define !
    this.addRoute = function (cfgMethod) {
        var curMiddleware = getMiddleware(unosApi, createConfigs, cfgMethod);
        if (cfgMethod) {
            var url = unosApi.getBaseURL(createConfigs, cfgMethod);
            unosApi.setToRouter({ method: method, createConfigs: createConfigs, cfgMethod: cfgMethod }, url, curMiddleware, cfgMethod);
        }
    };
    this.addObjectRoute = function (cfgMethod) {
        if (!cfgMethod.callback) {
            throw new Error("callback is not define !!! " + JSON.stringify(cfgMethod));
        }
        if (withParam && !cfgMethod.url) {
            throw new Error(method + "WithParam object need url !!! " + JSON.stringify(cfgMethod));
        }
        if (!withParam) {
            cfgMethod.url = '';
        }
        var curMiddleware = getMiddleware(unosApi, createConfigs, cfgMethod);
        var url = unosApi.getBaseURL(createConfigs, cfgMethod);
        unosApi.setToRouter({ method: method, cfgMethod: cfgMethod, createConfigs: createConfigs }, url, curMiddleware, cfgMethod.callback);
    };
    this.addArrayRoute = function (cfgMethod) {
        var cname = cfgMethod[0], ccallback = cfgMethod[1];
        // @ts-ignore
        if (!cname || (ccallback !== true && !ccallback)) {
            throw new Error("name or function is required ! ex: [':name', function]");
        }
        var _a = grabCallbackFromArray(cfgMethod), overrideMiddleware = _a.overrideMiddleware, callback = _a.callback;
        var name = cfgMethod.shift();
        var middleware = __spreadArrays(cfgMethod);
        var c = { url: name, callback: callback, middleware: middleware, overrideMiddleware: overrideMiddleware };
        var cfgMethodArray = Object.assign(cloneObj(METHOD_CONFIG), c);
        var curMiddleware = getMiddleware(unosApi, createConfigs, cfgMethodArray);
        var url = unosApi.getBaseURL(createConfigs, cfgMethodArray);
        unosApi.setToRouter({ method: method, cfgMethod: cfgMethodArray, createConfigs: createConfigs }, url, curMiddleware, callback);
    };
};
function useRoute(unosApi, createConfigs, method) {
    var cfgMethod = createConfigs[method];
    var configureApi = new ConfigureApi(unosApi, createConfigs, method);
    ArgumentHelpers.useObject(cfgMethod, configureApi.addRoute, configureApi.addObjectRoute);
}
function useRouteWithParam(unosApi, createConfigs, method) {
    // @ts-ignore
    var cfgMethod = createConfigs[method + 'WithParam'];
    var configureApi = new ConfigureApi(unosApi, createConfigs, method, true);
    ArgumentHelpers.useMultiArrayAndObject(cfgMethod, configureApi.addArrayRoute, configureApi.addObjectRoute);
}
var UnosApi = /** @class */ (function () {
    function UnosApi(router, configs) {
        if (!router) {
            throw new Error('router is required !');
        }
        this.configs = Object.assign(cloneObj(UNOS_CONFIG), configs);
        this.router = router;
        this.initRouteApis();
    }
    UnosApi.prototype.initRouteApis = function () {
        var titleApis = this.configs.title || (Object.entries(apis).length + 1).toString();
        apis[titleApis] = apis[titleApis] || {};
        this.curApis = apis[titleApis];
    };
    UnosApi.prototype.addToListRouteApis = function (_a) {
        var createConfigs = _a.createConfigs, method = _a.method, url = _a.url, callback = _a.callback;
        var baseURL = createConfigs.baseURL;
        var title = createConfigs.title || baseURL;
        this.curApis[title] = (this.curApis[title] || []);
        this.curApis[title].push({ url: url, method: method, functionName: callback.name });
    };
    UnosApi.prototype.getBaseURL = function (createConfigs, cfgMethod) {
        var urls = [createConfigs.baseURL];
        if ("url" in cfgMethod && cfgMethod.url) {
            urls.push(cfgMethod.url);
        }
        return [this.configs.baseURL, urls.join('/')].join('');
    };
    UnosApi.prototype.create = function (configs) {
        var curConfigs = Object.assign(cloneObj(CREATE_CONFIG), configs);
        for (var i = 0; i < allowedMethod.length; i++) {
            var method = allowedMethod[i];
            useRoute(this, curConfigs, method);
            useRouteWithParam(this, curConfigs, method);
        }
    };
    UnosApi.prototype.setToRouter = function (configs, url, middleware, callback) {
        var _a;
        var method = configs.method, cfgMethod = configs.cfgMethod, createConfigs = configs.createConfigs;
        // @ts-ignore
        var wrapperRequest = cfgMethod.wrapperRequest || createConfigs.wrapperRequest || this.configs.wrapperRequest;
        if (Array.isArray(callback)) {
            var cloneCallback = cloneArray(callback);
            // @ts-ignore
            var _b = grabCallbackFromArray(cloneCallback), overrideMiddleware = _b.overrideMiddleware, cb = _b.callback;
            // @ts-ignore
            callback = cb;
            // @ts-ignore
            middleware = __spreadArrays((overrideMiddleware ? [] : middleware), cloneCallback);
        }
        var curCallback = callback;
        if (wrapperRequest) {
            curCallback = wrapperRequest(callback);
            // @ts-ignore
            curCallback.rawCallback = callback;
        }
        this.addToListRouteApis({
            createConfigs: createConfigs, method: method, url: url, callback: callback
        });
        // @ts-ignore
        (_a = this.router)[method].apply(_a, __spreadArrays([url], middleware, [curCallback]));
    };
    Object.defineProperty(UnosApi, "getAllRoutes", {
        get: function () {
            return apis;
        },
        enumerable: true,
        configurable: true
    });
    return UnosApi;
}());
module.exports = UnosApi;
