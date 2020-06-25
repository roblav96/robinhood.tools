//

declare module 'proxify-url' {
	namespace Proxify {
		interface Options {
			inputFormat: string
			outputFormat: string
			callback: string
			jsonCompat: boolean
		}
	}
	function Proxify(url: string, opts?: Partial<Proxify.Options>): string
	export = Proxify
}
