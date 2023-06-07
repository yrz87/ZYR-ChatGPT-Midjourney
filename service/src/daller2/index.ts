import * as dotenv from 'dotenv'
import type { RequestOptions } from './types'
import { sendResponse } from '../utils'
// import axios from 'axios';
// const { Configuration, OpenAIApi } = require("openai");
import { Configuration, OpenAIApi } from 'openai'
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generationsImage(options: RequestOptions) {
  
  const { prompt } = options
  // console.log(prompt,"========chatReplyProcess=======key=",process.env.OPENAI_API_KEY)
  try {
    // Generate image from prompt
  const response = await openai.createImage({
    prompt: prompt,
    n: 1,
    size: "512x512",//['256x256', '512x512', '1024x1024'] - 'size'
  });
  // console.log("response===,",response)
  // Send back image url
  return sendResponse({ type: 'Success', data: response.data.data[0].url })
  } catch (error) {
    // console.log('generationsImage->Error: ' + error.message);
    return sendResponse({ type: 'Fail', message: error.message ?? error })
  }
}

export { generationsImage }
