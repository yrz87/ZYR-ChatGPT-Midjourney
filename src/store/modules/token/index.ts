import { defineStore } from 'pinia'
import type { TokenState, AuthInfo } from './helper'
import { defaultSetting, getLocalState, setLocalState } from './helper'

export const useTokenStore = defineStore('token-store', {
  state: (): TokenState => getLocalState(),
  actions: {
    updateSetting(authInfo: Partial<AuthInfo>) {
      this.authInfo = { ...this.authInfo, ...authInfo }
      this.recordState()
    },
    resetSetting() {
      this.authInfo = { ...defaultSetting().authInfo }
      this.recordState()
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})

