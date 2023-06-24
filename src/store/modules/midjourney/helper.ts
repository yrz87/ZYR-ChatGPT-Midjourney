import { ss } from '@/utils/storage'

const LOCAL_NAME = 'midjourneyStorage8'

export type Aspect= '1:1' | '4:3' | '3:4' | '16:9' | '9:16'

// export type DrawQuality = '' | 'high detail' | 'hyper quality' | 'high resolution' | 'Quixel Megascans Render' | 'FHD' | '1080P' | '4K' | '8K'
export type DrawQuality = 'low' | 'med' | 'high' | 'very high'

export type Stylize= 50 | 100 | 250 | 750

export type DrawModel = 'Midjourney' | 'NIJI' 


export function defaultState(): Midjourney.MidjourneyState {
  const uuid = 1002
  return {
    uuid:uuid,
    active: uuid,
    usingContext: true,
    aspect: '1:1', 
    drawModel: 'Midjourney',
    stylize: 50,
    drawQuality:"low",
    carryParam:true,
    chaos:0,
    progressNum:0,
    midjourney: [{ uuid, data: [] }],
  }
}
export function getLocalState(): Midjourney.MidjourneyState {
  const localState = ss.get(LOCAL_NAME)
  return { ...defaultState(), ...localState }
}

export function setLocalState(state: Midjourney.MidjourneyState) {
  ss.set(LOCAL_NAME, state)
}
