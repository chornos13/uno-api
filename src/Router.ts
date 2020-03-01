/*
	Author: Chornos13
 */

const ArgumentHelpers = require('./ArgumentHelpers');

type AsyncFunction = Promise<any> | (() => Promise<any>)
type TMiddleware = Array<Function | AsyncFunction> | Function
type TMethodConfig = IObjectMethodConfig | AsyncFunction
// @ts-ignore
type TArrayMethodParamConfig = [string, ...Array<Function | AsyncFunction>, boolean?]
type TMethodWithParamConfig = IObjectMethodParamConfig | Array<TArrayMethodParamConfig> | TArrayMethodParamConfig

interface IUnoConfig {
    title?: string
    baseURL: string
    middleware?: TMiddleware
    wrapperRequest?: AsyncFunction
}

interface IObjectMethodConfig {
    middleware?: TMiddleware
    callback: AsyncFunction
    overrideMiddleware?: boolean
    wrapperRequest?: AsyncFunction
}

interface IObjectMethodParamConfig extends IObjectMethodConfig{
    url: string
}

interface ICreateConfig {
    title?: string
    baseURL: string
    get?: TMethodConfig
    post?: TMethodConfig
    put?: TMethodConfig
    delete?: TMethodWithParamConfig
    getWithParam?: TMethodWithParamConfig
    postWithParam?: TMethodWithParamConfig
    putWithParam?: TMethodWithParamConfig
    deleteWithParam?: TMethodWithParamConfig
    middleware?: TMiddleware
    overrideMiddleware?: boolean
    wrapperRequest?: AsyncFunction
}


const apis: any = {};

const UNOS_CONFIG = {
    title: '',
    baseURL: '',
    middleware: undefined,
    wrapperRequest: undefined
};

const CREATE_CONFIG = {
    title: '',
    baseURL: '',
    get: undefined, post: undefined, put: undefined, delete: undefined,
    getWithParam: undefined, postWithParam: undefined,
    putWithParam: undefined, deleteWithParam: undefined,
    middleware: undefined,
    overrideMiddleware: false,
    wrapperRequest: undefined
};

const METHOD_CONFIG = {
    middleware: undefined,
    callback: undefined, url: undefined,
    overrideMiddleware: false,
    wrapperRequest: undefined
};

type TMethod =
    'get' | 'post' | 'put' | 'delete' |
    'getWithParam' | 'postWithParam' | 'putWithParam' | 'deleteWithParam'

const allowedMethod = ['get', 'post', 'put', 'delete'];

function cloneObj(obj: object) {
    return Object.assign({}, obj)
}

function cloneArray(arr: Array<any>) {
    return arr.slice(0)
}

function getMiddleware
(
    unosApi: UnosApi,
    createConfigs: ICreateConfig,
    cfgMethod: IObjectMethodConfig | IObjectMethodParamConfig | AsyncFunction
) {
    let priorityConfig = [cfgMethod, createConfigs, unosApi.configs];
    let curMiddleware: TMiddleware = [];
    for(let i = 0; i < priorityConfig.length; i++) {
        let config = cloneObj(priorityConfig[i]) as ICreateConfig;
        let middleware = ArgumentHelpers.getSingleArray(config.middleware, true);
        curMiddleware.splice(0, 0, ...middleware);
        if(config.overrideMiddleware) {
            break;
        }
    }
    return curMiddleware
}

function grabCallbackFromArray(arrCallback: TArrayMethodParamConfig):
    {
        overrideMiddleware: boolean;
        callback: string | Function | AsyncFunction | undefined | boolean
    } {
    let overrideMiddleware = false;
    let callback = arrCallback.pop();
    if(callback === true) {
        overrideMiddleware = true;
        callback = arrCallback.pop()
    }
    return {
        overrideMiddleware,
        callback
    }
}


interface IConfigureApi {
    addRoute(cfgMethod: IObjectMethodParamConfig | AsyncFunction): void,
    addObjectRoute(cfgMethod: IObjectMethodConfig): void,
    addArrayRoute(cfgMethod: TArrayMethodParamConfig): void,
}

const ConfigureApi = function (
    this: IConfigureApi,
    unosApi: UnosApi,
    createConfigs: ICreateConfig,
    method: TMethod,
    withParam: boolean = false
) {


    //adding method only when function is define !
    this.addRoute = (cfgMethod: IObjectMethodParamConfig | AsyncFunction) => {
        let curMiddleware = getMiddleware(unosApi, createConfigs, cfgMethod);
        if(cfgMethod) {
            const url = unosApi.getBaseURL(createConfigs, cfgMethod);
            unosApi.setToRouter({method, createConfigs, cfgMethod}, url, curMiddleware, cfgMethod)
        }
    };

    this.addObjectRoute = (cfgMethod: IObjectMethodParamConfig) => {
        if(!cfgMethod.callback) { throw new Error(`callback is not define !!! ${JSON.stringify(cfgMethod)}`)}
        if(withParam && !cfgMethod.url) { throw new Error(`${method}WithParam object need url !!! ${JSON.stringify(cfgMethod)}`)}
        if(!withParam) { cfgMethod.url = '' }
        let curMiddleware = getMiddleware(unosApi, createConfigs, cfgMethod);
        const url = unosApi.getBaseURL(createConfigs, cfgMethod);
        unosApi.setToRouter({method, cfgMethod, createConfigs}, url, curMiddleware, cfgMethod.callback)
    };


    this.addArrayRoute = (cfgMethod: TArrayMethodParamConfig) => {
        let [cname, ccallback] = cfgMethod;
        // @ts-ignore
        if(!cname || (ccallback !== true && !ccallback)) {
            throw new Error(`name or function is required ! ex: [':name', function]`)
        }

        let { overrideMiddleware, callback } = grabCallbackFromArray(cfgMethod);
        let name = cfgMethod.shift();
        let middleware = [...cfgMethod];

        let c = { url: name, callback, middleware, overrideMiddleware };
        let cfgMethodArray = Object.assign(cloneObj(METHOD_CONFIG), c) as IObjectMethodParamConfig;
        let curMiddleware = getMiddleware(unosApi, createConfigs, cfgMethodArray);
        const url = unosApi.getBaseURL(createConfigs, cfgMethodArray);
        unosApi.setToRouter(
            {method, cfgMethod: cfgMethodArray, createConfigs}, url, curMiddleware, callback as AsyncFunction | Function)
    }
} as any as {
    new (
        unosApi: UnosApi,
        createConfigs: ICreateConfig,
        method: string,
        withParam?: boolean
    ): IConfigureApi ;
};


function useRoute(unosApi: UnosApi, createConfigs: ICreateConfig, method: TMethod) {
    const cfgMethod = createConfigs[method];
    const configureApi = new ConfigureApi(unosApi, createConfigs, method);

    ArgumentHelpers.useObject(cfgMethod, configureApi.addRoute, configureApi.addObjectRoute)
}

function useRouteWithParam(unosApi: UnosApi, createConfigs: ICreateConfig, method: TMethod) {
    // @ts-ignore
    const cfgMethod = createConfigs[method + 'WithParam'];
    const configureApi = new ConfigureApi(unosApi, createConfigs, method, true);
    ArgumentHelpers.useMultiArrayAndObject(cfgMethod, configureApi.addArrayRoute, configureApi.addObjectRoute)
}

class UnosApi {
    configs: IUnoConfig;
    router: any;
    curApis!: any;

    constructor(router: any, configs: IUnoConfig) {
        if(!router) {
            throw new Error('router is required !')
        }
        this.configs = Object.assign(cloneObj(UNOS_CONFIG), configs);
        this.router = router;
        this.initRouteApis()
    }

    initRouteApis() {
        let titleApis = this.configs.title || (Object.entries(apis).length + 1).toString();
        apis[titleApis] = apis[titleApis] || {};
        this.curApis = apis[titleApis]
    }

    addToListRouteApis(
        {
            createConfigs, method, url, callback
        } :
            {
                createConfigs: ICreateConfig,
                method: TMethod,
                url: string,
                callback: AsyncFunction | Function
            }
    ) {
        const { baseURL } = createConfigs;
        const title = createConfigs.title || baseURL;
        this.curApis[title] = (this.curApis[title] || []);
        this.curApis[title].push({url, method, functionName: (callback as Function).name})
    }

    getBaseURL(createConfigs: ICreateConfig, cfgMethod: IObjectMethodParamConfig | AsyncFunction | Function) {
        const urls = [createConfigs.baseURL];
        if("url" in cfgMethod && cfgMethod.url) {
            urls.push(cfgMethod.url)
        }
        return [this.configs.baseURL, urls.join('/')].join('')
    }

    create(configs: ICreateConfig) {
        const curConfigs = Object.assign(cloneObj(CREATE_CONFIG), configs);
        for(let i = 0; i < allowedMethod.length; i++) {
            const method = allowedMethod[i] as TMethod;
            useRoute(this, curConfigs, method);
            useRouteWithParam(this, curConfigs, method)
        }
    }

    setToRouter(
        configs: { method: TMethod; createConfigs: ICreateConfig; cfgMethod: IObjectMethodParamConfig | Promise<any> | (() => Promise<any>) | ICreateConfig },
        url: string,
        middleware: TMiddleware,
        callback: IObjectMethodParamConfig | AsyncFunction | Function
    ) {
        const { method, cfgMethod, createConfigs } = configs;
        // @ts-ignore
        const wrapperRequest = cfgMethod.wrapperRequest || createConfigs.wrapperRequest || this.configs.wrapperRequest;
        if(Array.isArray(callback)) {
            let cloneCallback = cloneArray(callback);
            // @ts-ignore
            let { overrideMiddleware, callback: cb } =  grabCallbackFromArray(cloneCallback);
            // @ts-ignore
            callback = cb;
            // @ts-ignore
            middleware = [...(overrideMiddleware ? [] : middleware), ...cloneCallback]
        }

        let curCallback = callback;
        if(wrapperRequest) {
            curCallback = wrapperRequest(callback);
            // @ts-ignore
            curCallback.rawCallback = callback
        }
        this.addToListRouteApis({
            createConfigs, method, url, callback: callback as Function
        });

        // @ts-ignore
        this.router[method](url, ...middleware, curCallback)
    }

    static get getAllRoutes() {
        return apis
    }
}

module.exports = UnosApi;
