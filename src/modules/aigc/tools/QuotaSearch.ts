import { Tool } from '@langchain/core/tools'
import searchEngineTool from 'search-engine-tool'

interface BaseParameters {

  /**
   * Specify the client-side timeout of the request. In milliseconds.
   */
  timeout?: number
}

enum SearchEngine {
  BING = 'bing', Google = 'google', DuckDuckGo = 'duckduckgo', Yahoo = 'yahoo',
}

export interface QuotaSearchAPIParameters extends BaseParameters {
  /**
   * Search Query
   * Parameter defines the query you want to search. You can use anything that you
   * would use in a regular Google search. e.g. `inurl:`, `site:`, `intitle:`. We
   * also support advanced search query parameters such as as_dt and as_eq. (Like)See the
   * [full list](https://serpapi.com/advanced-google-query-parameters) of supported
   * advanced search query parameters.
   */
  query: string

  engine: SearchEngine
}

export class QuotaSearchAPI extends Tool {
  static lc_name() {
    return 'QuotaSearchAPI'
  }

  toJSON() {
    return this.toJSONNotImplemented()
  }

  protected params: Partial<QuotaSearchAPIParameters>

  constructor(
    params: Partial<QuotaSearchAPIParameters> = {},
  ) {
    super()

    this.params = params
  }

  name = 'search'

  /** @ignore */
  _call(input: string) {
    const { timeout, ...params } = this.params

    return new Promise<string>((resolve, reject) => {
      setTimeout(() => resolve('timeout'), timeout ?? 10000)

      try {
        searchEngineTool(input + params.query, params.engine ?? 'bing')
          .then((results: any) => {
            resolve(JSON.stringify(results))
          })
      }
      catch (e) {
        console.error(e)
        reject(e)
      }
    })
  }

  description
    = 'a search engine. useful for when you need to answer questions about current events. input should be a search query.'
}
