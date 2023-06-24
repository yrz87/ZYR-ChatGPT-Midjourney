declare namespace Midjourney {

	interface Midjourney {
        taskId:string
        status:string
        imgUrl:string
        action:string
        model:string
		dateTime: string
		failReason: string
		progress: string
		// error?: boolean
		finished?: boolean
		// conversationOptions?: ConversationRequest | null
		requestOptions: { prompt: string;promptEn: string;description: string}
	}

	// interface History {
	// 	title: string
	// 	isEdit: boolean
	// 	uuid: number
	// }

	interface MidjourneyState {
		uuid: number
		active: number | null
		usingContext: boolean
		carryParam: boolean
		drawModel: DrawModel
		stylize: Stylize
		drawQuality: DrawQuality
		chaos: number
		progressNum: number
		aspect: Aspect
		midjourney: { uuid: number; data: Midjourney[] }[]
	}

	// interface ConversationRequest {
	// 	conversationId?: string
	// 	parentMessageId?: string
	// }

	// interface ConversationResponse {
	// 	conversationId: string
	// 	detail: {
	// 		choices: { finish_reason: string; index: number; logprobs: any; text: string }[]
	// 		created: number
	// 		id: string
	// 		model: string
	// 		object: string
	// 		usage: { completion_tokens: number; prompt_tokens: number; total_tokens: number }
	// 	}
	// 	id: string
	// 	parentMessageId: string
	// 	role: string
	// 	text: string
	// }
}
