declare const ArgumentHelpers: any;
declare type AsyncFunction = Promise<any> | (() => Promise<any>);
declare type TMiddleware = Array<Function | AsyncFunction> | Function;
declare type TMethodConfig = IObjectMethodConfig | AsyncFunction;
declare type TArrayMethodParamConfig = [string, ...Array<Function | AsyncFunction>, boolean?];
declare type TMethodWithParamConfig = IObjectMethodParamConfig | Array<TArrayMethodParamConfig> | TArrayMethodParamConfig;
interface IUnoConfig {
    title?: string;
    baseURL: string;
    middleware?: TMiddleware;
    wrapperRequest?: AsyncFunction;
}
interface IObjectMethodConfig {
    middleware?: TMiddleware;
    callback: AsyncFunction;
    overrideMiddleware?: boolean;
    wrapperRequest?: AsyncFunction;
}
interface IObjectMethodParamConfig extends IObjectMethodConfig {
    url: string;
}
interface ICreateConfig {
    title?: string;
    baseURL: string;
    get?: TMethodConfig;
    post?: TMethodConfig;
    put?: TMethodConfig;
    delete?: TMethodWithParamConfig;
    getWithParam?: TMethodWithParamConfig;
    postWithParam?: TMethodWithParamConfig;
    putWithParam?: TMethodWithParamConfig;
    deleteWithParam?: TMethodWithParamConfig;
    middleware?: TMiddleware;
    overrideMiddleware?: boolean;
    wrapperRequest?: AsyncFunction;
}
declare const apis: any;
declare const UNOS_CONFIG: {
    title: string;
    baseURL: string;
    middleware: undefined;
    wrapperRequest: undefined;
};
declare const CREATE_CONFIG: {
    title: string;
    baseURL: string;
    get: undefined;
    post: undefined;
    put: undefined;
    delete: undefined;
    getWithParam: undefined;
    postWithParam: undefined;
    putWithParam: undefined;
    deleteWithParam: undefined;
    middleware: undefined;
    overrideMiddleware: boolean;
    wrapperRequest: undefined;
};
declare const METHOD_CONFIG: {
    middleware: undefined;
    callback: undefined;
    url: undefined;
    overrideMiddleware: boolean;
    wrapperRequest: undefined;
};
declare type TMethod = 'get' | 'post' | 'put' | 'delete' | 'getWithParam' | 'postWithParam' | 'putWithParam' | 'deleteWithParam';
declare const allowedMethod: string[];
declare function cloneObj(obj: object): {} & object;
declare function cloneArray(arr: Array<any>): any[];
declare function getMiddleware(unosApi: UnosApi, createConfigs: ICreateConfig, cfgMethod: IObjectMethodConfig | IObjectMethodParamConfig | AsyncFunction): (Function | Promise<any> | (() => Promise<any>))[];
declare function grabCallbackFromArray(arrCallback: TArrayMethodParamConfig): {
    overrideMiddleware: boolean;
    callback: string | Function | AsyncFunction | undefined | boolean;
};
interface IConfigureApi {
    addRoute(cfgMethod: IObjectMethodParamConfig | AsyncFunction): void;
    addObjectRoute(cfgMethod: IObjectMethodConfig): void;
    addArrayRoute(cfgMethod: TArrayMethodParamConfig): void;
}
declare const ConfigureApi: new (unosApi: UnosApi, createConfigs: ICreateConfig, method: string, withParam?: boolean | undefined) => IConfigureApi;
declare function useRoute(unosApi: UnosApi, createConfigs: ICreateConfig, method: TMethod): void;
declare function useRouteWithParam(unosApi: UnosApi, createConfigs: ICreateConfig, method: TMethod): void;
declare class UnosApi {
    configs: IUnoConfig;
    router: any;
    curApis: any;
    constructor(router: any, configs: IUnoConfig);
    initRouteApis(): void;
    addToListRouteApis({ createConfigs, method, url, callback }: {
        createConfigs: ICreateConfig;
        method: TMethod;
        url: string;
        callback: AsyncFunction | Function;
    }): void;
    getBaseURL(createConfigs: ICreateConfig, cfgMethod: IObjectMethodParamConfig | AsyncFunction | Function): string;
    create(configs: ICreateConfig): void;
    setToRouter(configs: {
        method: TMethod;
        createConfigs: ICreateConfig;
        cfgMethod: IObjectMethodParamConfig | Promise<any> | (() => Promise<any>) | ICreateConfig;
    }, url: string, middleware: TMiddleware, callback: IObjectMethodParamConfig | AsyncFunction | Function): void;
    static get getAllRoutes(): any;
}
