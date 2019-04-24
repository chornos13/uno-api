# uno-api

[![npm version](https://img.shields.io/npm/v/uno-api.svg?style=flat-square)](https://www.npmjs.org/package/uno-api)
[![build status](https://img.shields.io/travis/chornos13/uno-api.svg?style=flat-square)](https://travis-ci.org/chornos13/uno-api)
[![install size](https://packagephobia.now.sh/badge?p=uno-api)](https://packagephobia.now.sh/result?p=uno-api)
[![npm downloads](https://img.shields.io/npm/dm/uno-api.svg?style=flat-square)](http://npm-stat.com/charts.html?package=uno-api)

simplify express router


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

/* GET home page. */
simpleRouter.create({
  baseURL: '/',
  middleware: MiddlewareAuth.token, //use array example: [MiddlewareAuth.token, MiddlewareAuth.ip]
  get: mainPage
})

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


#### unoApi.Router(config)

```js
//example
const simpleRouter = new unoApi.Router({
	baseURL: '',
	middleware: undefined,
})
```

#### simpleRouter.create(createConfig)

```js
simpleRouter.create({
	baseURL: '/public',
	get: undefined, post: undefined, put: undefined, delete: undefined,
	getWithParam: undefined, postWithParam: undefined,
	putWithParam: undefined, deleteWithParam: undefined,
	middleware: undefined,
	overrideMiddleware: false,
})
```


#### method config

```js
simpleRouter.create({
	baseURL: '/public',
	get: {
		middleware: undefined,
		callback: undefined, url: undefined,
		overrideMiddleware: false
	}
})
```
