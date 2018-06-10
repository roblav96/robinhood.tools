// 

declare namespace NodeJS { interface Global { Zousan: { suppressUncaughtRejectionError: boolean } } }
interface PromiseConstructor {
	suppressUncaughtRejectionError: boolean
	delay(ms: number): Promise<void>
}


