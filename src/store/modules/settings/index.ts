import { defineStore } from 'pinia'
import type { SettingsState,Model,NavType  } from './helper'
import { defaultSetting, getLocalState, removeLocalState, setLocalState } from './helper'

export const useSettingStore = defineStore('setting-store', {
  state: (): SettingsState => getLocalState(),
  actions: {
    updateSetting(settings: Partial<SettingsState>) {
      this.$state = { ...this.$state, ...settings }
      this.recordState()
    },

    resetSetting() {
      this.$state = defaultSetting()
      removeLocalState()
    },

    setModel(model: Model) {
      if (this.model !== model) {
        this.model = model
        this.recordState()
      }
    },
    setNavType(navType: NavType) {
      if (this.navType !== navType) {
        this.navType = navType
        this.recordState()
      }
    },
    recordState() {
      setLocalState(this.$state)
    },
  },
})
