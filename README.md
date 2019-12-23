# uno-api

[![npm version](https://img.shields.io/npm/v/uno-api.svg?style=flat-square)](https://www.npmjs.org/package/uno-api)
[![build status](https://img.shields.io/travis/chornos13/uno-api.svg?style=flat-square)](https://travis-ci.org/chornos13/uno-api)
[![install size](https://packagephobia.now.sh/badge?p=uno-api)](https://packagephobia.now.sh/result?p=uno-api)
[![npm downloads](https://img.shields.io/npm/dm/uno-api.svg?style=flat-square)](http://npm-stat.com/charts.html?package=uno-api)

simplify express router

#What's New in 1.2.0
- getAllRoutes, for get all list route in uno-api


## installing

```bash
$ npm install uno-api
```

## Example
```js
var router = express.Router();
const UnoRouter = require('uno-api').Router
const simpleRouter = new UnoRouter(router)
const MiddlewareAuth = require('./controllers/MiddlewareAuth')
const UserController = require('./controllers/UserController')
function mainPage(req, res, next) {
  res.render('index', { title: 'Express' });
}

simpleRouter.create({
	baseURL: '/user',
	get: UserController.getUser,
	getWithParam: [
		[':UserId', UserController.getUserByUserId], //ex: http://localhost:3000/user/1
		[':UserId/:RoleId', MiddlewareAuth.main, UserController.getUserByRoleId] //ex: http://localhost:3000/user/1/5
	],
	post: {
		middleware: MiddlewareAuth.multer([{ name: 'file', maxCount: 1 }]), //or with array [MiddlewareAuth.multer([{ name: 'file', maxCount: 1 }])],
		callback: UserController.createUser
	},
	put: UserController.updateUser,
	delete: UserController.deleteUser,
})


```


## unoAPI


Key | Type | Object Key
--- | --- | ---
`Router` | Function | configRouter 
`OPTIONS` | Object | 


#### unoApi.Router(config)
config

Key | Type | Desc
--- | --- | ---
`title` | string | title for getAll
`baseURL` | string | baseURL for this Router 
`middleware` | function, array function | middleware for this Router 
`wrapperRequest` | function | wrapperRequest / wrapper callback


```js
//example

const simpleRouter = new unoApi.Router({
	title: 'RoutePublic', // this is grouping name routes for getAllRoutes
	baseURL: '', // you can define global baseURL here for this route
	middleware: [Middleware1, Middleware2], // you can define middleware here
	wrapperRequest: wrapperApiPublic // handle all callback by this function, ex: wrapperApiPublic(callback)
})
```


### .Router API
Key | Type | Desc
--- | --- | ---
`getAllRoutes` | static function | to get all Routes Uno-Api
`create` | function | to create route 

#### simpleRouter.create(createConfig)

create config

Key | Type | Desc
--- | --- | ---
`title` | string | grouping name for getAllRoutes
`baseURL` | string | url API 
`get` | function, array function, object | get method 
`getWithParam` | array | get method 
`post` | function, array function, object | post method 
`postWithParam` | array | post method 
`put` | function, array function, object | put method 
`putWithParam` | array | put method 
`delete` | function, array function, object | delete method 
`deleteWithParam` | array | delete method 
`middleware` | function / array function | middleware  
`overrideMiddleware` | boolean | override middleware UnoApi.Router  
`wrapperRequest` | function | wrapperRequest / wrapper callback  


```js
simpleRouter.create({
    title: 'ApiMasterData',
    baseURL: '/master',
    get: myGetFunction, 
    post: [myMiddlewarePost, myPostFunction],
    put: {
      middleware: [myMiddlewarePut],
      callback: myPutFunction,
      overrideMiddleware: true
    },
    delete: [myMiddlewareDelete, myDeleteFunction, UnoApi.OPTIONS.OVERRIDE_MIDDLEWARE], // like put
    getWithParam: [
      [':id', myMiddlewareGetParam, myGetParamFunction], //ex: http://example.com/master/1
      [':id/:userid', myMiddlewareGetParam, myGetParamFunction, UnoApi.OPTIONS.OVERRIDE_MIDDLEWARE], //ex: http://example.com/master/1/299
      ['detail', myMiddlewareGetParam, myGetParamFunction, UnoApi.OPTIONS.OVERRIDE_MIDDLEWARE], //ex: http://example.com/master/detail
    ], // this config same for all route method get, post, put, delete (withParam)
    middleware: [MiddlewareMasterData],
    overrideMiddleware: true, // this will remove all UnoApi.Router middleware only for this API
    wrapperRequest: wrapperRequestMaster // wrapperRequest only for this API master, this will replace wrapperRequest UnoApi.Router
})
```


#### method config

method config

Key | Type | Desc
--- | --- | ---
`callback` | function | callback method 
`middleware` | function / array function | middleware  
`overrideMiddleware` | boolean | override middleware UnoApi.Router and .create  
`wrapperRequest` | function | wrapperRequest for this method only  

```js
simpleRouter.create({
	baseURL: '/public',
	get: {
            middleware: myGetMiddleware,
            callback: myGetFunction,
            overrideMiddleware: true,
            wrapperRequest: wrapperRequestMethod //
	},
	put: {
            middleware: myPutMiddleware,
            callback: wrapperRequestMethod(myPutFunction), //this is same like using wrapperRequest
            overrideMiddleware: true,
	}
})
```
