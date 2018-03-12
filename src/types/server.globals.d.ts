// 



declare namespace NodeJS {
	interface Process {
		dtsgen: (name: string, value: any) => void
		clipboard: (name: string, input: string) => void
		INSTANCE: number
		INSTANCES: number
		MASTER: boolean
		WORKER: boolean
		PRIMARY: boolean
	}
}



interface Console {
	format(args: any): any
}




