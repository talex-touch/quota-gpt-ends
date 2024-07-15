import { ChatMessageHistory } from '@langchain/community/stores/message/in_memory'
import { Calculator } from '@langchain/community/tools/calculator'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import type { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableWithMessageHistory } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents'
import { pull } from 'langchain/hub'

import QuotaConfig from './quota-config'
import { QuotaSearchAPI, QuotaSearchImagesAPI, QuotaSearchVideosAPI } from './tools/QuotaSearch'

const chatModel = new ChatOpenAI({
  // model: 'bot-20240627143728-9k2vc',
  // model: 'ep-20240711120450-hpfcs',
  // model: 'ep-20240713111716-l2k9w',
  // model: 'ep-20240713111812-l9ptj',
  model: 'gpt-3.5-turbo',
  // model: 'ep-20240713114452-k4t8v',
  temperature: 0,
  // apiKey: 'sk-JCDNisBbwMyIrCXUCa89Cd815c094fDb812fF4035b8b543e',
  openAIApiKey: 'sk-u1RFUsfnnyHAZyQQ56114c02606640Ab8b0a23Ab3dF516Eb',
  // openAIApiKey: 'sk-0VhRzdg4OcdO7XXo598bDf0255Bb43CfB6Ec36B8A299Ea32',
  // apiKey: '27217108-708c-44f5-b3f3-befd9bda6e79',
  // apiKey: 'sk-u1RFUsfnnyHAZyQQ56114c02606640Ab8b0a23Ab3dF516Eb',
  // apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/bots/chat/completions',
  // apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  // streaming: true,

  configuration: {

    baseURL: 'https://api.aiskt.com/v1',
    // baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    // baseURL: 'https://ngedlktfticp.cloud.sealos.io/v1',
  },
  // streaming: true,
  // stream_options: {

  //   include_usage: true,
  // },
})

// /* new SerpAPI(), new TavilySearchResults({}) ,*/
const tools = [new QuotaSearchVideosAPI(), new QuotaSearchImagesAPI(), new QuotaSearchAPI(), new Calculator()]
// const parser = new HttpResponseOutputParser()

// chatModel.pipe(parser)

// chatModel.bindTools(tools)

export class ModelAgent {
  async generate() {
    const prompt = await pull<ChatPromptTemplate>(
      'hwchase17/openai-functions-agent',
    )

    const agent = await createOpenAIFunctionsAgent({
      llm: chatModel,
      tools,
      prompt, // : ChatPromptTemplate.fromMessages([new SystemMessage(quotaConfig.prompt), ['placeholder', '{chat_history}'], ['human', '{input}'], ['placeholder', '{agent_scratchpad}']]),
    })

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
    }).withConfig({ runName: 'Agent' })

    return agentExecutor
  }

  async withHistory(messages: any[]) {
    const chatMessageHistory = new ChatMessageHistory()

    chatMessageHistory.addMessage(new SystemMessage(QuotaConfig.prompt))

    const chat_history: any = [...messages].map((msg) => {
      const { role, content } = msg
      if (!content)
        return null

      if (role === 'system') {
        chatMessageHistory.addMessage(new SystemMessage(content))
        return new SystemMessage(content)
      }
      else if (role === 'assistant') {
        chatMessageHistory.addAIMessage(content)
        return new AIMessage(content)
      }
      else if (role === 'user') {
        chatMessageHistory.addUserMessage(content)
        return new HumanMessage(content)
      }

      return null
    }).filter(item => item !== null)

    const agent = await this.generate()

    const agentWithChatHistory = new RunnableWithMessageHistory({
      runnable: agent,
      getMessageHistory: () => chatMessageHistory,
      inputMessagesKey: 'input',
      historyMessagesKey: 'chat_history',
    })

    return [agentWithChatHistory, chat_history]
  }
}

export const modelAgent = new ModelAgent()
