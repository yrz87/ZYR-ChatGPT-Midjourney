import { ss } from '@/utils/storage'

const LOCAL_NAME = 'tokenStorage'

export interface AuthInfo {
  systemToken: string
  surplusNum: number
  useNum: number
  getTokenUrl:string
  tokenVerification:boolean,
  openFreeNum:boolean,
  freeNum:number,
  userIdentify:number,
  startDate:string,
  expressDate:string
  expressDateNumber:number,
  vipToGpt4Num:number,
}

export interface TokenState {
  authInfo: AuthInfo
}
export function defaultSetting(): TokenState {
  return {
    authInfo: {
      systemToken: ``,
      tokenVerification:false,//token验证是否有效 默认无效
      surplusNum: 0,//userIdentify = 0时有效。剩余次数
      useNum: 0,//userIdentify = 0时有效。使用次数
      getTokenUrl:"http://www.xiaoxuebook.com/category/8ECFBB1942752D26",//获取密钥链接
      openFreeNum:false,//是否开启免费试用次数
      freeNum:3,//免费使用次数
      vipToGpt4Num:0,//vip会员，当前KEY还剩几次使用
      userIdentify:-1,//用户身份  0 购买次数的  1 购买包月的
      startDate:"",//userIdentify = 1时有效。 验证时间
      expressDate:"",//userIdentify = 1时有效。过期时间
      expressDateNumber:0,
    },
  }
}
export function defaultState(): Chat.ChatState {
  const uuid = 1003
  return {
    active: uuid,
    usingContext: true,
    history: [{ uuid, title: 'New Chat', isEdit: false }],
    chat: [{ uuid, data: [] }],
  }
}
export function getLocalState(): TokenState {
  const localSetting: TokenState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: TokenState): void {
  ss.set(LOCAL_NAME, setting)
}
