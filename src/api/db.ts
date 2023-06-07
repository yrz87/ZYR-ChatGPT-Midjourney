import { post } from '@/utils/request/dbRequest'
import {useTokenStore } from '@/store'
const tokenStore = useTokenStore()
export function generateImage<T = any>(
  params: {
    prompt: string
  },
) {
  try {
    const response =  post<T>({
      url: '/generate-image',
      data: { prompt: params.prompt,userIdentify:tokenStore.authInfo.userIdentify,token:tokenStore.authInfo.systemToken}
    })
    // console.log("generateImage->response:",response); // 打印服务器返回的数据
    return response;
  } catch (error) {
    // console.log("insertQuestion->error,",error);
    return error;
  }
}

// 根据token,修改剩余次数
export async function insertMessage<T = any>(
  params: { token: string,question: string,type:number}
) {
  try {
    console.log("insertQuestion",params.token,params.question,params.type);
    const response = await post<T>({
      url: '/insertQuestion', // 修改为完整的URL
      data: { token: params.token,question: params.question,type:params.type},
    });
    console.log("insertQuestion->response:",response); // 打印服务器返回的数据
    // return response.data; // 返回服务器返回的数据
    return response ; // 返回服务器返回的数据
  } catch (error) {
    console.log("insertQuestion->error,",error);
    return error;
  }
}


export async function updateNumByToken<T = any>(
  params: { question:string,userIdentify:number,token: string,type:number,version:string}
) {
  try {
    const response = await post<T>({
      url: '/updateNumByToken', // 修改为完整的URL
      data: { question:params.question,userIdentify:params.userIdentify,token: params.token,type:params.type,chatModel:params.version},
    });
    return response ; // 返回服务器返回的数据
  } catch (error) {
    return error;
  }
}
// export async function verificationCode() {
//   try {
//     const options = {
//       url: "/verificationCode",
//       data: { token: "md7Kw0k3pdzd2oMR89I7aibFLBuU04hn" },
//       headers: { "Content-Type": "application/json" },
//     };

//     const response = await post(options);
//     console.log("返回值：", response);
//   } catch (error) {
//     console.error("请求发生错误：", error);
//   }
// }
// 验证token是否有效/正确,以及剩余次数
export async function verificationCode<T = any>(
  params: { token: string }
  ) {
  try {
    console.log("verificationCode",params.token);
    const response = await post<T>({
      url: '/verificationCode', // 修改为完整的URL
      data: { token: params.token },
    });
    console.log("verificationCode->response:",response);
    return response;
  } catch (error) {
    console.error('verificationCode->Error:', error);
    return error;
  }
}

// export async function post<T>({
//   url,
//   data,
// }: {
//   url: string;
//   data: any;
// }): Promise<T> {
//   try {
//     const response = await axios.post(url, data);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// }