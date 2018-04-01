// 



declare module 'cctz' {

	class CivilTime {
		constructor()
		clone(): any
		startOfDay(): any
		startOfHour(): any
		startOfMonth(): any
		startOfYear(): any
	}

	class TimeZone {
		constructor()
		lookup(): any
	}

	const path: string
	function convert(): any
	function format(): any
	function load_time_zone(): any
	function now(): void
	function parse(): any
	function tz(): any

}


