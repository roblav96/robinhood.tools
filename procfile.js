"use strict";
// 
exports.__esModule = true;
var _ = require("lodash");
var os = require("os");
module.exports = function (pandora) {
    var cpus = os.cpus().length;
    // pandora
    // 	.service('robinhood.tools', './main.js')
    // 	.process('worker')
    // 	.scale('auto')
    // .name('robinhood.tools')
    // .config(function(ctx) {
    // 	return { port: 12300 }
    // })
    // console.log('this ->', this)
    // pandora.cluster('./main.js')
    pandora
        .process('worker')
        .entry('./dist/server/main.js')
        .scale('auto')
        .env({
        "NODE_ENV": "development"
    });
    console.log('final pandora ->', pandora);
    // /** 
    // * you can custom workers scale number
    // */
    // // pandora
    // //   .process('worker')
    // //   .scale(2); // .scale('auto') means os.cpus().length
    // /**
    //  * you can also use fork mode to start application 
    //  */
    // // pandora
    // //   .fork('robinhood.tools', './blank');
    // /**
    //  * you can create another process here
    //  */
    // // pandora
    // //   .process('background')
    // //   .nodeArgs(['--expose-gc']);
    // /**
    //  * more features please visit our document.
    //  * https://github.com/midwayjs/pandora/
    //  */
};
var util = require("util");
_.merge(util.inspect, {
    defaultOptions: {
        showHidden: true,
        showProxy: true,
        depth: 2,
        compact: false,
        breakLength: Infinity,
        maxArrayLength: Infinity,
        colors: true
    },
    styles: {
        string: 'green', regexp: 'green', date: 'green',
        number: 'magenta', boolean: 'blue',
        undefined: 'red', "null": 'red',
        symbol: 'cyan', special: 'cyan'
    }
});
