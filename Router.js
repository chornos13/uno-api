/*
	Author: Chornos13
 */
const ArgumentHelpers = require('./ArgumentHelpers')

const UNOS_CONFIG = {
	baseURL: '',
	middleware: undefined,
}

const CREATE_CONFIG = {
	baseURL: '',
	get: undefined, post: undefined, put: undefined, delete: undefined,
	getWithParam: undefined, postWithParam: undefined,
	putWithParam: undefined, deleteWithParam: undefined,
	middleware: undefined,
	overrideMiddleware: false,
}

const METHOD_CONFIG = {
	middleware: undefined,
	callback: undefined, url: undefined,
	overrideMiddleware: false
}

const allowedMethod = ['get', 'post', 'put', 'delete']

function clone(obj) {
	return Object.assign({}, obj)
}

function getMiddleware(unosApi, createConfigs, cfgMethod) {
	let priorityConfig = [cfgMethod, createConfigs, unosApi.configs]
	let curMiddleware = []
	for(let i = 0; i < priorityConfig.length; i++) {
		let config = clone(priorityConfig[i])
		let middleware = ArgumentHelpers.getSingleArray(config.middleware, true)
		curMiddleware.splice(0, 0, ...middleware)
		if(config.overrideMiddleware) {
			break;
		}
	}
	return curMiddleware
}

function ConfigureApi(unosApi, createConfigs, method, withParam = false) {
	//adding method only when function is define !
	this.addRoute = (cfgMethod) => {
		let curMiddleware = getMiddleware(unosApi, createConfigs, cfgMethod)
		if(cfgMethod) {
			unosApi.router[method](unosApi.getBaseURL(createConfigs, cfgMethod), ...curMiddleware, cfgMethod)
		}
	}

	this.addObjectRoute = (cfgMethod) => {
		if(!cfgMethod.callback) { throw new Error(`callback is not define !!! ${JSON.stringify(cfgMethod)}`)}
		if(withParam && !cfgMethod.url) { throw new Error(`${method}WithParam object need url !!! ${JSON.stringify(cfgMethod)}`)}
		if(!withParam) { cfgMethod.url = '' }
		let curMiddleware = getMiddleware(unosApi, createConfigs, cfgMethod)
		unosApi.router[method](unosApi.getBaseURL(createConfigs, cfgMethod), ...curMiddleware, cfgMethod.callback)
	}


	this.addArrayRoute = (cfgMethod) => {
		let [cname, ccallback] = cfgMethod
		if(!cname || (ccallback !== true && !ccallback)) {
			throw new Error(`name or function is required ! ex: [':name', function]`)
		}
		let overrideMiddleware = false
		let callback = cfgMethod.pop()
		if(callback === true) {
			overrideMiddleware = true
			callback = cfgMethod.pop()
		}
		let name = cfgMethod.shift()
		let middleware = [...cfgMethod]

		let c = { url: name, callback, middleware, overrideMiddleware }
		let cfgMethodArray = Object.assign(clone(METHOD_CONFIG), c)
		let curMiddleware = getMiddleware(unosApi, createConfigs, cfgMethodArray)
		unosApi.router[method](unosApi.getBaseURL(createConfigs, cfgMethodArray), ...curMiddleware, callback)
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
		this.configs = Object.assign(clone(UNOS_CONFIG), configs)
		this.router = router
	}

	getBaseURL(createConfigs, cfgMethod) {
		return [this.configs.baseURL, [createConfigs.baseURL, cfgMethod.url || ''].join('/')].join('')
	}

	create(configs) {
		const curConfigs = Object.assign(clone(CREATE_CONFIG), configs)
		for(let i = 0; i < allowedMethod.length; i++) {
			const method = allowedMethod[i]
			useRoute(this, curConfigs, method)
			useRouteWithParam(this, curConfigs, method)
		}
	}
}

module.exports = UnosApi
