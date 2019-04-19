function isPureObject(val) {
	if (val === undefined || val === null || Array.isArray(val)) { return false;}
	const exc = ['function', 'string']
	return ( (!exc.includes(typeof val)) || (typeof val === 'object') );
}

//ex: [[a, b], [c, d]] or [a,b]
function useMultiArray(data, cb, cbObj) {
	if(data) {
		if(Array.isArray(data)) {
			if(data.length === 0) {
				throw new Error('Array cannot be empty !')
			}
			else if(Array.isArray(data[0])) { //cek data isi data dalam array ex: [[a,b], [c,d]] -> [a,b]
				for(let i = 0; i < data.length; i++) {
					cb(data[i])
				}
			}
			else {
				cb(data)
			}
		} else {
			throw new Error('Method With Param require Array !')
		}
	}
}

//ex: [[a, 'b], {a, b}] or [a,b] or {a, b}
function useMultiArrayAndObject(data, cbArray, cbObj) {
	if(data) {
		if(Array.isArray(data)) {
			if(data.length === 0) {
				throw new Error('Array cannot be empty !')
			}
			else if(Array.isArray(data[0]) || isPureObject(data[0])) { //cek data isi data dalam array ex: [[a,b], [c,d]] -> [a,b]
				for (let i = 0; i < data.length; i++) {
					let arrayOrObj = data[i]
					if (isPureObject(arrayOrObj)) {
						cbObj(arrayOrObj)
					} else if (Array.isArray(arrayOrObj)) {
						cbArray(arrayOrObj)
					}
				}
			}
			else {
				cbArray(data)
			}
		}
	} else if(isPureObject(data)) {
		cbObj(data)
	}
	// else {
	// 	throw new Error(`required array or object ! ${data}`)
	// }
}

//ex: a or [a] or [a, b, c]
function useSingleArray(data, cb, forceDataToArray = false) {
	if(data) {
		if(Array.isArray(data)) {
			for(let i = 0; i < data.length; i++) {
				cb(data[i])
			}
		} else {
			cb(forceDataToArray ? [data] : data)
		}
	} else if(forceDataToArray) {
		cb([])
	}
}

//ex: a or [a] or [a, b, c]
function getSingleArray(data, forceDataToArray = false) {
	if(data) {
		if(Array.isArray(data)) {
			return data
		} else {
			return forceDataToArray ? [data] : data
		}
	} else if(forceDataToArray) {
		return []
	}
}

//ex: a or {a}
function useObject(data, cb, cbObject) {
	if(data) {
		if(isPureObject(data)) {
			cbObject(data)
		} else {
			cb(data)
		}
	}
}

//ex: a or {a} or [a]
function useSingleArrayAndObject(data, cb, cbObject, forceDataToArray = false) {
	if(data) {
		if(isPureObject(data)) {
			cbObject(data)
		} else {
			data = forceDataToArray ? [data] : data
			if(Array.isArray(data)) {
				for(let i = 0; i < data.length; i++) {
					cb(data[i])
				}
			} else {
				cb(data)
			}
		}
	}
}

module.exports = {
	useMultiArray,
	useObject,
	useSingleArray,
	getSingleArray,
	useMultiArrayAndObject
}
