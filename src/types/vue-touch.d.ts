// 

declare module 'vue-touch' {
	import Vue from 'vue'

	namespace VueTouch {
		const component: Vue
		const config: object
		const customEvents: { [key: string]: Partial<RecognizerOptions> }
		function install(): void
		function registerCustomEvent(name: string, options: Partial<RecognizerOptions>): void
	}
	export default VueTouch

}
