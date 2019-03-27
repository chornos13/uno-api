/*
	Author: Chornos13
 */
const ArgumentHelpers = require('./ArgumentHelpers')

const UNOS_CONFIG = {
	baseUrl: '',
	middleware: undefined,
}

const CREATE_CONFIG = {
	baseUrl: '',
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
	// console.log(curMiddleware)
	return curMiddleware
}

function ConfigureApi(unosApi, createConfigs, method, withParam = false) {
	//adding method only when function is define !
	this.addRoute = (cfgMethod) => {
		let curMiddleware = getMiddleware(unosApi, createConfigs, cfgMethod)
		if(cfgMethod) {
			unosApi.router[method](unosApi.getBaseUrl(createConfigs, cfgMethod), ...curMiddleware, cfgMethod)
		}
	}

	this.addObjectRoute = (cfgMethod) => {
		if(!cfgMethod.callback) { throw new Error(`callback is not define !!! ${JSON.stringify(cfgMethod)}`)}
		if(withParam && !cfgMethod.url) { throw new Error(`${method}WithParam object need url !!! ${JSON.stringify(cfgMethod)}`)}
		if(!withParam) { cfgMethod.url = '' }
		let curMiddleware = getMiddleware(unosApi, createConfigs, cfgMethod)
		unosApi.router[method](unosApi.getBaseUrl(createConfigs, cfgMethod), ...curMiddleware, cfgMethod.callback)
	}


	this.addArrayRoute = (cfgMethod) => {
		let [name, callback, middleware] = cfgMethod
		if(!name || !callback) {
			throw new Error(`name or function is required ! ex: [':name', function]`)
		}

		let c = { url: name, callback, middleware }
		let cfgMethodArray = Object.assign(clone(METHOD_CONFIG), c)
		let curMiddleware = getMiddleware(unosApi, createConfigs, cfgMethodArray)
		unosApi.router[method](unosApi.getBaseUrl(createConfigs, cfgMethodArray), ...curMiddleware, callback)
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

	getBaseUrl(createConfigs, cfgMethod) {
		return [this.configs.baseUrl, [createConfigs.baseUrl, cfgMethod.url || ''].join('/')].join('')
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
