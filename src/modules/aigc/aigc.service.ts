import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { Observable } from 'rxjs'

import { modelAgent } from './agents'

const header = {
  Accept: 'text/event-stream',
  Authorization: 'Bearer sk-u1RFUsfnnyHAZyQQ56114c02606640Ab8b0a23Ab3dF516Eb',
}

@Injectable()
export class AiGcService {
  constructor(
  ) { }

  execute(body: any): Observable<any> {
    const { messages } = body
    if (!messages || !messages.length) {
      return new Observable((subscriber) => {
        subscriber.next(JSON.stringify({
          type: 'error',
          message: 'messages is empty',
        }))
        subscriber.complete()
      })
    }

    const lastMsg = messages.at(-1)
    const input = (lastMsg?.content) || `ERROR`

    const ob$ = new Observable((subscriber) => {
      let lastSent = -1

      function sendHeartPack() {
        if (subscriber.closed)
          return

        if (Date.now() - lastSent >= 1000 * 3)
          subscriber.next(JSON.stringify({ type: 'heartbeat', time: Date.now() }))

        setTimeout(sendHeartPack, 5000)
      }

      sendHeartPack()

      async function _invoke() {
        const [executor] = await modelAgent.withHistory(messages)

        const langChainStream = await executor.streamEvents({
          input,
        }, {
          version: 'v2',
          configurable: {
            sessionId: Date.now(),
            // llm: 'openai_gpt_3_5_turbo',
          },
          // metadata: {
          //   conversation_id: 'other_metadata',
          // },
        })

        for await (const step of langChainStream) {
          lastSent = Date.now()

          // if (step?.event !== 'on_chat_model_stream')
          //   console.log(step)

          subscriber.next(JSON.stringify(step))
        }

        subscriber.complete()
      }

      _invoke()
    })

    return ob$
  }

  // execute(body: any): Observable<any> {
  //   const { messages } = body

  //   const ob$ = new Observable((subscriber) => {
  //     async function _invoke() {
  //       const executor = await initializeAgentExecutorWithOptions(tools, chatModel, {
  //         agentType: 'zero-shot-react-description',
  //         verbose: true,
  //       })

  //       const lastMsg = messages.at(-1)
  //       const input = (lastMsg?.content) || `ERROR`

  //       const stream = await executor.stream({
  //         input,
  //         chat_history: [...messages].map((msg) => {
  //           const { role, content } = msg
  //           if (!content)
  //             return null

  //           if (role === 'system') {
  //             return new SystemMessage(content)
  //           }
  //           else if (role === 'assistant') {
  //             return new AIMessage(content)
  //           }
  //           else if (role === 'user') {
  //             return new HumanMessage(content)
  //           }

  //           return null
  //         }).filter(item => item !== null),
  //       }, {
  //         callbacks: [
  //           {
  //             handleAgentAction(action, runId) {
  //               subscriber.next(JSON.stringify({
  //                 type: 'action',
  //                 status: 'start',
  //                 action,
  //                 runId,
  //               }))
  //             },
  //             handleAgentEnd(action, runId) {
  //               subscriber.next(JSON.stringify({
  //                 type: 'action',
  //                 status: 'end',
  //                 action,
  //                 runId,
  //               }))
  //             },
  //             handleToolEnd(output, runId) {
  //               console.log('\nhandleToolEnd', output, runId)
  //             },
  //           },
  //         ],
  //       })

  //       for await (const chunk of stream) {
  //         subscriber.next(JSON.stringify({
  //           type: 'chunk',
  //           ...chunk,
  //         }, null, 2))
  //       }

  //       subscriber.next(JSON.stringify({
  //         type: 'end',
  //       }))
  //       subscriber.complete()
  //     }

  //     _invoke()
  //   })

  //   return ob$
  // }

  complete(body: any): Observable<any> {
    const ob$ = new Observable((subscriber) => {
      axios.post('https://api.aiskt.com/v1/chat/completions', { ...body }, {
        responseType: 'stream',
        headers: {
          ...header,
        },
      }).then((response) => {
        response.data.on('data', (data) => {
          const lines = data.toString().split('\n').filter(line => line.trim() !== '')

          for (const line of lines) {
            const message = line.replace(/^data: /, '')
            if (message === '[DONE]') {
              subscriber.next('data: DONE\n\n')
              subscriber.complete()
              return
            }
            // const parsed = JSON.parse(message)

            subscriber.next(message)
          }
        })
      })
    })

    return ob$
  }
}
