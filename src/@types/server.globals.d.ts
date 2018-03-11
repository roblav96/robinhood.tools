// 



declare namespace NodeJS {
	interface Process {
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




