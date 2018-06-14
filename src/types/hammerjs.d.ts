// 

import * as Hammer from 'hammerjs'

declare global {

	interface RecognizerOptions {
		type?: string
	}

	interface HammerManager {
		handlers: { [event: string]: HammerListener }
	}

	interface Recognizer {
		canRecognizeWith(recognizers: Recognizer[]): boolean
		recognizeWith(recognizers: Recognizer[]): Recognizer[]
		requireFailure(recognizers: Recognizer[]): Recognizer[]
		dropRecognizeWith(recognizers: Recognizer[]): Recognizer[]
		dropRequireFailure(recognizers: Recognizer[]): Recognizer[]
	}

	interface HammerEvent {
		preventDefault(): void
		additionalEvent: string
		angle: number
		center: { x: number, y: number }
		changedPointers: PointerEvent[]
		deltaTime: number
		deltaX: number
		deltaY: number
		direction: number
		distance: number
		eventType: number
		isFinal: boolean
		isFirst: boolean
		maxPointers: number
		offsetDirection: number
		overallVelocity: number
		overallVelocityX: number
		overallVelocityY: number
		pointerType: string
		pointers: any[]
		rotation: number
		scale: number
		srcEvent: PointerEvent
		tapCount: number
		target: HTMLElement
		timeStamp: number
		type: string
		velocity: number
		velocityX: number
		velocityY: number
	}

}


