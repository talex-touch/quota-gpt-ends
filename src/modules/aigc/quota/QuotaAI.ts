import type { ChatCompletionRequest, ChatVolcParams, VolcMessage } from './types'

export class QuotaAI implements ChatVolcParams {
  constructor(params: ChatVolcParams) {
    Object.assign(this, params)
  }

  async completions(req: ChatCompletionRequest) {

  }

  apiUrl: string
  model: string
  messages?: VolcMessage[]
  apiKey?: string
  temperature?: number
  topP?: number
  maxTokens?: number
  stop?: string[]
  frequencyPenalty?: number
}
