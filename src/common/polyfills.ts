// 



Array.prototype.forEach = function(fn, arg) {
	let array = this
	let len = array.length
	let i: number
	if (!arg) {
		for (i = 0; i < len; i++) {
			let value = array[i]
			fn(value, i, array)
		}
	} else {
		let ctx = arg
		for (i = 0; i < len; i++) {
			let value = array[i]
			fn.call(ctx, value, i, array)
		}
	}
}

Array.prototype.map = function(fn, arg) {
	let array = this
	let len = array.length
	let i: number
	let mapped = new Array(len)
	if (!arg) {
		for (i = 0; i < len; i++) {
			let value = array[i]
			mapped[i] = fn(value, i, array)
		}
	} else {
		let ctx = arg
		for (i = 0; i < len; i++) {
			let value = array[i]
			mapped[i] = fn.call(ctx, value, i, array)
		}
	}
	return mapped
}

Array.prototype.filter = function(fn, arg) {
	let array = this
	let len = array.length
	let i: number
	let filtered = []
	if (!arg) {
		for (i = 0; i < len; i++) {
			let value = array[i]
			if (fn(value, i, array)) filtered.push(value);
		}
	} else {
		let ctx = arg
		for (i = 0; i < len; i++) {
			let value = array[i]
			if (fn.call(ctx, value, i, array)) filtered.push(value);
		}
	}
	return filtered
}

Array.prototype.find = function(fn, arg) {
	let array = this
	let len = array.length
	let i: number
	if (!arg) {
		for (i = 0; i < len; i++) {
			let value = array[i]
			if (fn(value, i, array)) return value;
		}
	} else {
		let ctx = arg
		for (i = 0; i < len; i++) {
			let value = array[i]
			if (fn.call(ctx, value, i, array)) return value;
		}
	}
	return undefined
}

// Array.prototype.remove = function(fn, arg) {
// 	let array = this
// 	let len = array.length
// 	let i: number
// 	if (!arg) {
// 		for (i = 0; i < len; i++) {
// 			let value = array[i]
// 			if (fn(value, i, array)) array.splice(i, 1);
// 		}
// 	} else {
// 		let ctx = arg
// 		for (i = 0; i < len; i++) {
// 			let value = array[i]
// 			if (fn.call(ctx, value, i, array)) array.splice(i, 1);
// 		}
// 	}
// }
// interface Array<T> { remove(fn: (value: T, index: number, array: Array<T>) => boolean, thisArg?: any): void }



// const isBrowser = !new Function('try { return this === global; } catch(e) { return false }')()
// if (isBrowser) {
if (Error.captureStackTrace === undefined) {
	Error.captureStackTrace = function captureStackTrace(error) {
		let container = new Error()
		Object.defineProperty(error, 'stack', {
			configurable: true,
			get: function getStack() {
				let stack = container.stack
				Object.defineProperty(this, 'stack', { value: stack })
				return stack
			}
		})
	}
}
// }


