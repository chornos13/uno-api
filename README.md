# uno-api

[![npm version](https://img.shields.io/npm/v/uno-api.svg?style=flat-square)](https://www.npmjs.org/package/uno-api)
[![build status](https://img.shields.io/travis/chornos13/uno-api.svg?style=flat-square)](https://travis-ci.org/uno-api/uno-api)
[![code coverage](https://img.shields.io/coveralls/chornos13/uno-api.svg?style=flat-square)](https://coveralls.io/r/chornos13/uno-api)
[![install size](https://packagephobia.now.sh/badge?p=uno-api)](https://packagephobia.now.sh/result?p=uno-api)
[![npm downloads](https://img.shields.io/npm/dm/uno-api.svg?style=flat-square)](http://npm-stat.com/charts.html?package=uno-api)
[![gitter chat](https://img.shields.io/gitter/room/chornos13/uno-api.svg?style=flat-square)](https://gitter.im/chornos13/uno-api)
[![code helpers](https://www.codetriage.com/uno-api/uno-api/badges/users.svg)](https://www.codetriage.com/uno-api/uno-api)

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

function mainPage(req, res, next) {
  res.render('index', { title: 'Express' });
}

/* GET home page. */
simpleRouter.create({
  baseUrl: '/',
  get: mainPage
})
```


## unoAPI


#### unoApi.Router(config)

```js
//example
const simpleRouter = new unoApi.Router({
	baseUrl: '',
	middleware: undefined,
})
```

#### simpleRouter.create(createConfig)

```js
simpleRouter.create({
	baseUrl: '/public',
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
baseUrl: '/public',
get: {
        middleware: undefined,
        callback: undefined, url: undefined,
        overrideMiddleware: false
    }
})
```
