// 

declare module 'correcting-interval' {
	export function clearCorrectingInterval(id: number): void
	export function setCorrectingInterval(fn: () => void, timeout: number): number
}


