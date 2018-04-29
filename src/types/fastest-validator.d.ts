// 

declare module 'fastest-validator' {

	namespace FastestValidator {

		interface Messages {
			array: string
			arrayContains: string
			arrayEmpty: string
			arrayEnum: string
			arrayLength: string
			arrayMax: string
			arrayMin: string
			boolean: string
			date: string
			dateMax: string
			dateMin: string
			email: string
			forbidden: string
			function: string
			number: string
			numberEqual: string
			numberInteger: string
			numberMax: string
			numberMin: string
			numberNegative: string
			numberNotEqual: string
			numberPositive: string
			required: string
			string: string
			stringContains: string
			stringEmpty: string
			stringEnum: string
			stringLength: string
			stringMax: string
			stringMin: string
			stringPattern: string
		}

		interface Rules {
			any(): any
			array(value: any, schema: any): any
			custom(value: any, schema: any): any
			date(value: any, schema: any): any
			email(value: any, schema: any): any
			forbidden(value: any): any
			number(value: any, schema: any): any
			object(value: any): any
			string(value: any, schema: any): any
			url(value: any): any
		}

		type Type = keyof Messages | keyof Rules
		interface SchemaValue {
			type: Type
			items: Type
			enum: string[]
			positive: boolean
			integer: boolean
			min: number
			max: number
		}
		interface Schema {
			[key: string]: SchemaValue | Type
		}

		type CompiledValidator = (value: any) => boolean
		interface Options { messages: Messages }
		class FastestValidator {
			constructor(opts?: Options)
			opts: Options
			messages: Messages
			add(type: any, fn: (value: any) => boolean): void
			compile(schema: any): CompiledValidator
			handleResult(errors: any, fieldPath: any, result: any): void
			makeError(type: any, expected: any, actual: any): any
			resolveMessage(error: any): any
			validate(value: any, schema: any): any
		}

	}

	interface FastestValidator extends FastestValidator.FastestValidator { }
	class FastestValidator { }
	export = FastestValidator

}

