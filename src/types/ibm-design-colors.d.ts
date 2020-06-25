//

declare module 'ibm-design-colors/source/colors' {
	namespace ibmdesigncolors {
		interface Value {
			grade: string
			value: string
		}
		interface Pallet {
			core: string
			name: string
			synonyms: string[]
			values: Value[]
		}
		const version: string
		const palettes: Pallet[]
	}
	export = ibmdesigncolors
}
