// 



const ws = new Sockette('ws://127.0.0.1:12299/radio', {
	timeout: 300,
	onopen: function(event) {
		console.log('OPEN ->', event.target.url)
	},
	onclose: function(event) {
		console.log('CLOSE ->', event)
	},
	onerror: function(error) {
		console.error('ERROR ->', error)
	},
	onmessage: function(event) {
		let message = event.data
		if (message == 'pong') return;
		if (message == 'ping') return this.send('pong');
		console.log('MESSAGE ->', message)
	},
})

setInterval(function ping() { ws.send('ping') }, 5000)












function noop() { }

function Sockette(url, opts) {
	opts = opts || {};

	let k, ws, num, $ = {}, self = this;
	let ms = opts.timeout || 1e3, max = opts.maxAttempts || Infinity;

	$.onmessage = opts.onmessage || noop;

	$.onclose = e => {
		(e.code !== 1e3 && e.code !== 1005) && self.reconnect(e);
		(opts.onclose || noop)(e);
	};

	$.onerror = e => {
		(e && e.code === 'ECONNREFUSED') ? self.reconnect(e) : (opts.onerror || noop)(e);
	};

	$.onopen = e => {
		num = 0; (opts.onopen || noop)(e);
	};

	self.open = () => {
		ws = new WebSocket(url, opts.protocols);
		for (k in $) ws[k] = $[k];
	};

	self.reconnect = e => {
		(num++ < max) ? setTimeout(_ => {
			(opts.onreconnect || noop)(e);
			self.open();
		}, ms) : (opts.onmaximum || noop)(e);
	};

	self.json = x => {
		ws.send(JSON.stringify(x));
	};

	self.send = x => {
		ws.send(x);
	};

	self.close = (x, y) => {
		ws.close(x, y);
	};

	self.open(); // init

	return self;
}


