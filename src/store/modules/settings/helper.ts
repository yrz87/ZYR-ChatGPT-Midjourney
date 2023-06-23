import { ss } from '@/utils/storage'

const LOCAL_NAME = 'settingsStorage'

export type Model = 'gpt-3.5-turbo' | 'gpt-4' | 'Daller2'
export type NavType = 'ChatGPT' | 'Daller2'| 'Midjourney' | 'Gallery'| 'MindMap'
// export type NavType = 'chat' | 'drawer'| 'midjourney' | 'gallery'| 'mind-map'

export interface SettingsState {
  systemMessage: string,
  temperature: number,
  top_p: number,
  model: Model,
  navType: NavType,

}
export function defaultSetting(): SettingsState {
  const currentDate = new Date().toISOString().split('T')[0]
  return {
    systemMessage: `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nKnowledge cutoff: 2021-09-01\nCurrent date: ${currentDate}`,
    temperature: 0.8,
    top_p: 1,
    model: 'gpt-3.5-turbo',
    navType: 'ChatGPT'
  }
}

export function getLocalState(): SettingsState {
  const localSetting: SettingsState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: SettingsState): void {
  ss.set(LOCAL_NAME, setting)
}

export function removeLocalState() {
  ss.remove(LOCAL_NAME)
}
