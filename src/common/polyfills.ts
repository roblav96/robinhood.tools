// 

// ████████████████████████████
//       HIGH PERFORMANCE
// ████████████████████████████



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


