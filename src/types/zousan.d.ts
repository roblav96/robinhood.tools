// 

declare namespace NodeJS { interface Global { Zousan: { suppressUncaughtRejectionError: boolean } } }
interface PromiseConstructor {
	suppressUncaughtRejectionError: boolean
}
interface Promise<T> {
	timeout(ms: number): Promise<T>
}


