/*
	Author: Chornos13
 */
const ArgumentHelpers = require('./ArgumentHelpers')

const apis = {}

const UNOS_CONFIG = {
	title: '',
	baseURL: '',
	middleware: undefined,
	wrapperRequest: undefined
}

const CREATE_CONFIG = {
	title: '',
	baseURL: '',
	get: undefined, post: undefined, put: undefined, delete: undefined,
	getWithParam: undefined, postWithParam: undefined,
	putWithParam: undefined, deleteWithParam: undefined,
	middleware: undefined,
	overrideMiddleware: false,
	wrapperRequest: undefined
}

const METHOD_CONFIG = {
	middleware: undefined,
	callback: undefined, url: undefined,
	overrideMiddleware: false,
	wrapperRequest: undefined
}

const allowedMethod = ['get', 'post', 'put', 'delete']

function cloneObj(obj) {
	return Object.assign({}, obj)
}

function cloneArray(arr) {
	return arr.slice(0)
}

function getMiddleware(unosApi, createConfigs, cfgMethod) {
	let priorityConfig = [cfgMethod, createConfigs, unosApi.configs]
	let curMiddleware = []
	for(let i = 0; i < priorityConfig.length; i++) {
		let config = cloneObj(priorityConfig[i])
		let middleware = ArgumentHelpers.getSingleArray(config.middleware, true)
		curMiddleware.splice(0, 0, ...middleware)
		if(config.overrideMiddleware) {
			break;
		}
	}
	return curMiddleware
}

function grabCallbackFromArray(arrCallback) {
	let overrideMiddleware = false
	let callback = arrCallback.pop()
	if(callback === true) {
		overrideMiddleware = true
		callback = arrCallback.pop()
	}
	return {
		overrideMiddleware,
		callback
	}
}


function ConfigureApi(unosApi, createConfigs, method, withParam = false) {
	//adding method only when function is define !
	this.addRoute = (cfgMethod) => {
		let curMiddleware = getMiddleware(unosApi, createConfigs, cfgMethod)
		if(cfgMethod) {
			const url = unosApi.getBaseURL(createConfigs, cfgMethod)
			unosApi.setToRouter({method, createConfigs, cfgMethod}, url, curMiddleware, cfgMethod)
		}
	}

	this.addObjectRoute = (cfgMethod) => {
		if(!cfgMethod.callback) { throw new Error(`callback is not define !!! ${JSON.stringify(cfgMethod)}`)}
		if(withParam && !cfgMethod.url) { throw new Error(`${method}WithParam object need url !!! ${JSON.stringify(cfgMethod)}`)}
		if(!withParam) { cfgMethod.url = '' }
		let curMiddleware = getMiddleware(unosApi, createConfigs, cfgMethod)
		const url = unosApi.getBaseURL(createConfigs, cfgMethod)
		unosApi.setToRouter({method, cfgMethod, createConfigs}, url, curMiddleware, cfgMethod.callback)
	}


	this.addArrayRoute = (cfgMethod) => {
		let [cname, ccallback] = cfgMethod
		if(!cname || (ccallback !== true && !ccallback)) {
			throw new Error(`name or function is required ! ex: [':name', function]`)
		}

		let { overrideMiddleware, callback } = grabCallbackFromArray(cfgMethod)
		let name = cfgMethod.shift()
		let middleware = [...cfgMethod]

		let c = { url: name, callback, middleware, overrideMiddleware }
		let cfgMethodArray = Object.assign(cloneObj(METHOD_CONFIG), c)
		let curMiddleware = getMiddleware(unosApi, createConfigs, cfgMethodArray)
		const url = unosApi.getBaseURL(createConfigs, cfgMethodArray)
		unosApi.setToRouter({method, cfgMethod: cfgMethodArray, createConfigs}, url, curMiddleware, callback)
	}
}


function useRoute(unosApi, createConfigs, method) {
	const cfgMethod = createConfigs[method]
	const configureApi = new ConfigureApi(unosApi, createConfigs, method)

	ArgumentHelpers.useObject(cfgMethod, configureApi.addRoute, configureApi.addObjectRoute)
}

function useRouteWithParam(unosApi, createConfigs, method) {
	const cfgMethod = createConfigs[method + 'WithParam']
	const configureApi = new ConfigureApi(unosApi, createConfigs, method, true)
	ArgumentHelpers.useMultiArrayAndObject(cfgMethod, configureApi.addArrayRoute, configureApi.addObjectRoute)
}

class UnosApi {
	constructor(router, configs) {
		if(!router) {
			throw new Error('router is required !')
		}
		this.configs = Object.assign(cloneObj(UNOS_CONFIG), configs)
		this.router = router
		this.initRouteApis()
	}

	initRouteApis() {
		let titleApis = this.configs.title || (Object.entries(apis).length + 1).toString()
		apis[titleApis] = {}
		this.curApis = apis[titleApis]
	}

	addToListRouteApis({createConfigs, method, url, callback}) {
		const { baseURL } = createConfigs
		const title = createConfigs.title || baseURL
		this.curApis[title] = (this.curApis[title] || [])
		this.curApis[title].push({url, method, functionName: callback.name})
	}

	getBaseURL(createConfigs, cfgMethod) {
		const urls = [createConfigs.baseURL]
		if(cfgMethod.url) {
			urls.push(cfgMethod.url)
		}
		return [this.configs.baseURL, urls.join('/')].join('')
	}

	create(configs) {
		const curConfigs = Object.assign(cloneObj(CREATE_CONFIG), configs)
		for(let i = 0; i < allowedMethod.length; i++) {
			const method = allowedMethod[i]
			useRoute(this, curConfigs, method)
			useRouteWithParam(this, curConfigs, method)
		}
	}

	setToRouter(configs, url, middleware, callback) {
		const { method, cfgMethod, createConfigs } = configs
		const wrapperRequest = cfgMethod.wrapperRequest || createConfigs.wrapperRequest || this.configs.wrapperRequest
		if(Array.isArray(callback)) {
			let cloneCallback = cloneArray(callback)
			let { overrideMiddleware, callback: cb } =  grabCallbackFromArray(cloneCallback)
			callback = cb
			middleware = [...(overrideMiddleware ? [] : middleware), ...cloneCallback]
		}

		let curCallback = callback
		if(wrapperRequest) {
			curCallback = wrapperRequest(callback)
		}
		this.addToListRouteApis({createConfigs, method, url, callback})

		this.router[method](url, ...middleware, curCallback)
	}

	static get getAllRoutes() {
		return apis
	}
}

module.exports = UnosApi
