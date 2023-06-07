import * as dotenv from 'dotenv'
import 'isomorphic-fetch'
import type { ChatGPTAPIOptions, ChatMessage, SendMessageOptions } from 'chatgpt'
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI } from 'chatgpt'
import { SocksProxyAgent } from 'socks-proxy-agent'
import httpsProxyAgent from 'https-proxy-agent'
import fetch from 'node-fetch'
import { sendResponse } from '../utils'
import { isNotEmptyString } from '../utils/is'
import type { ApiModel, ChatContext, ChatGPTUnofficialProxyAPIOptions, ModelConfig } from '../types'
import type { RequestOptions, SetProxyOptions, UsageResponse } from './types'

const { HttpsProxyAgent } = httpsProxyAgent

dotenv.config()

const {
  OPENAI_API_KEY,
  OPENAI_ACCESS_TOKEN,
  OPENAI_API_BASE_URL,
  OPENAI_API_MODEL,
  OPENAI_API_DISABLE_DEBUG,
  TIMEOUT_MS,
  API_REVERSE_PROXY,
  SOCKS_PROXY_HOST,
  SOCKS_PROXY_PORT,
  SOCKS_PROXY_USERNAME,
  SOCKS_PROXY_PASSWORD,
  HTTPS_PROXY,
  ALL_PROXY,
} = process.env;

const ErrorCodeMessage: Record<string, string> = {
  401: '[OpenAI] 提供错误的API密钥 | Incorrect API key provided',
  403: '[OpenAI] 服务器拒绝访问，请稍后再试 | Server refused to access, please try again later',
  502: '[OpenAI] 错误的网关 |  Bad Gateway',
  503: '[OpenAI] 服务器繁忙，请稍后再试 | Server is busy, please try again later',
  504: '[OpenAI] 网关超时 | Gateway Time-out',
  500: '[OpenAI] 服务器繁忙，请稍后再试 | Internal Server Error',
}

const timeoutMs: number = !isNaN(+TIMEOUT_MS) ? +TIMEOUT_MS : 100 * 1000
const disableDebug: boolean = OPENAI_API_DISABLE_DEBUG === 'true'

let apiModel: ApiModel
let model = isNotEmptyString(OPENAI_API_MODEL) ? OPENAI_API_MODEL : 'gpt-3.5-turbo'

if (!isNotEmptyString(OPENAI_API_KEY) && !isNotEmptyString(OPENAI_ACCESS_TOKEN))
  throw new Error('Missing OPENAI_API_KEY or OPENAI_ACCESS_TOKEN environment variable')

let api: ChatGPTAPI | ChatGPTUnofficialProxyAPI

// New function to set model parameters
function setModelParams(options: ChatGPTAPIOptions | SendMessageOptions, model: string) {
  if (model.toLowerCase().includes('gpt-4')) {
    // if use 32k model
    if (model.toLowerCase().includes('32k')) {
      options.maxModelTokens = 32768
      options.maxResponseTokens = 819
    }
    else {
      options.maxModelTokens = 8192
      options.maxResponseTokens = 2048
    }
  }
}

(async () => {
  // More Info: https://github.com/transitive-bullshit/chatgpt-api

  if (isNotEmptyString(OPENAI_API_KEY)) {
    const options: ChatGPTAPIOptions = {
      apiKey: OPENAI_API_KEY,
      completionParams: { model },
      debug: !disableDebug,
    }

    setModelParams(options, model);

    if (isNotEmptyString(OPENAI_API_BASE_URL))
      options.apiBaseUrl = `${OPENAI_API_BASE_URL}/v1`

    setupProxy(options)

    api = new ChatGPTAPI({ ...options })
    apiModel = 'ChatGPTAPI'
  }
  else {
    const options: ChatGPTUnofficialProxyAPIOptions = {
      accessToken: OPENAI_ACCESS_TOKEN,
      apiReverseProxyUrl: isNotEmptyString(API_REVERSE_PROXY) ? API_REVERSE_PROXY : 'https://ai.fakeopen.com/api/conversation',
      model,
      debug: !disableDebug,
    }
    
    setupProxy(options)

    api = new ChatGPTUnofficialProxyAPI({ ...options })
    apiModel = 'ChatGPTUnofficialProxyAPI'
  }
})()
async function chatReplyProcess(options: RequestOptions) {
  
  const { message, lastContext, process, systemMessage, temperature, top_p, chatModel  } = options
  
  try {
    let options: SendMessageOptions = { timeoutMs }
      
    model = chatModel

    if (apiModel === 'ChatGPTAPI') {
      if (isNotEmptyString(systemMessage))
        options.systemMessage = systemMessage
      options.completionParams = { model, temperature, top_p }
    }
    if (lastContext != null) {
      if (apiModel === 'ChatGPTAPI')
        options.parentMessageId = lastContext.parentMessageId
      else
        options = { ...lastContext }
    }
    setModelParams(options, chatModel);
    console.log("message:",message);
    const response = await api.sendMessage(message, {
      ...options,
      onProgress: (partialResponse) => {
        process?.(partialResponse)
      },
    })
    console.log("response:",response);
    return sendResponse({ type: 'Success', data: response })
  }
  catch (error: any) {
    const code = error.statusCode
    global.console.log(error)
    if (Reflect.has(ErrorCodeMessage, code))
      return sendResponse({ type: 'Fail', message: ErrorCodeMessage[code] })
    return sendResponse({ type: 'Fail', message: error.message ?? 'Please check the back-end console' })
  }
}

async function fetchUsage() {
  if (!isNotEmptyString(OPENAI_API_KEY))
    return Promise.resolve('-')

  const API_BASE_URL = isNotEmptyString(OPENAI_API_BASE_URL)
    ? OPENAI_API_BASE_URL
    : 'https://api.openai.com'
    
  const [startDate, endDate] = formatDate()

  // 每月使用量
  const urlUsage = `${API_BASE_URL}/v1/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`

  const headers = {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  }

  const options = {} as SetProxyOptions

  setupProxy(options)

  try {
    // 获取已使用量
    const useResponse = await options.fetch(urlUsage, { headers })
    if (!useResponse.ok)
      throw new Error('获取使用量失败')
    const usageData = await useResponse.json() as UsageResponse
    const usage = Math.round(usageData.total_usage) / 100
    return Promise.resolve(usage ? `$${usage}` : '-')
  }
  catch (error) {
    global.console.log(error)
    return Promise.resolve('-')
  }
}

function formatDate(): string[] {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const lastDay = new Date(year, month, 0)
  const formattedFirstDay = `${year}-${month.toString().padStart(2, '0')}-01`
  const formattedLastDay = `${year}-${month.toString().padStart(2, '0')}-${lastDay.getDate().toString().padStart(2, '0')}`
  return [formattedFirstDay, formattedLastDay]
}

async function chatConfig() {
  const usage = await fetchUsage()
  const reverseProxy = API_REVERSE_PROXY ?? '-'
  const httpsProxy = (HTTPS_PROXY || ALL_PROXY) ?? '-'
  const socksProxy = (SOCKS_PROXY_HOST && SOCKS_PROXY_PORT)
    ? (`${SOCKS_PROXY_HOST}:${SOCKS_PROXY_PORT}`)
    : '-'
  return sendResponse<ModelConfig>({
    type: 'Success',
    data: { apiModel, reverseProxy, timeoutMs, socksProxy, httpsProxy, usage },
  })
}

function setupProxy(options: SetProxyOptions) {
  if (isNotEmptyString(SOCKS_PROXY_HOST) && isNotEmptyString(SOCKS_PROXY_PORT)) {
    const agent = new SocksProxyAgent({
      hostname: SOCKS_PROXY_HOST,
      port: SOCKS_PROXY_PORT,
      userId: isNotEmptyString(SOCKS_PROXY_USERNAME) ? SOCKS_PROXY_USERNAME : undefined,
      password: isNotEmptyString(SOCKS_PROXY_PASSWORD) ? SOCKS_PROXY_PASSWORD : undefined,
    })
    options.fetch = (url, options) => {
      return fetch(url, { agent, ...options })
    }
  }
  
  else if (isNotEmptyString(HTTPS_PROXY) || isNotEmptyString(ALL_PROXY)) {
    const httpsProxy = HTTPS_PROXY || ALL_PROXY
    if (httpsProxy) {
      const agent = new HttpsProxyAgent(httpsProxy)
      options.fetch = (url, options) => {
        return fetch(url, { agent, ...options })
      }
    }
  }
  else {
    options.fetch = (url, options) => {
      return fetch(url, { ...options })
    }
  }
}

function currentModel(): ApiModel {
  return apiModel
}

export type { ChatContext, ChatMessage }

export { chatReplyProcess, chatConfig, currentModel }
