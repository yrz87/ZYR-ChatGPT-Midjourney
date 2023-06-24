import { defineStore } from 'pinia'
import { defaultState,getLocalState, setLocalState,Aspect,DrawModel,Stylize,DrawQuality } from './helper'
import { router } from '@/router'

export const useMidjourneyStore = defineStore('midjourney-store', {
  state: (): Midjourney.MidjourneyState => getLocalState(),

  getters: {
    // getMidjourneyHistoryByCurrentActive(state: Midjourney.MidjourneyState) {
    //   const index = state.history.findIndex(item => item.uuid === state.active)
    //   if (index !== -1)
    //     return state.history[index]
    //   return null
    // },
    getMidjourneyByPage(state: Midjourney.MidjourneyState) {
      return (uuid?: number, page: number = 1, pageSize: number = 10) => {
        const start = (page - 1) * pageSize
        const end = page * pageSize
        if (uuid)
          return state.midjourney.find(item => item.uuid === uuid)?.data.slice(start, end) ?? []
        return state.midjourney.find(item => item.uuid === state.active)?.data.slice(start, end) ?? []
      }
    },    
    getMidjourneyByUuid(state: Midjourney.MidjourneyState) {
      return (uuid?: number) => {
        if (uuid)
          return state.midjourney.find(item => item.uuid === uuid)?.data ?? []
        return state.midjourney.find(item => item.uuid === state.active)?.data ?? []
      }
    },
    getMidjourneyByUuidLength(state: Midjourney.MidjourneyState) {
      return (uuid?: number) => {
        if (uuid)
          return state.midjourney.find(item => item.uuid === uuid)?.data.length ?? 0
        return state.midjourney.find(item => item.uuid === state.active)?.data.length ?? 0
      }
    }
    
  },

  actions: {
    setUsingContext(context: boolean) {
      this.usingContext = context
      this.recordState()
    },

    

    

    // async deleteHistory(index: number) {
    //   this.history.splice(index, 1)
    //   this.midjourney.splice(index, 1)

    //   if (this.history.length === 0) {
    //     this.active = null
    //     this.reloadRoute()
    //     return
    //   }

    //   if (index > 0 && index <= this.history.length) {
    //     const uuid = this.history[index - 1].uuid
    //     this.active = uuid
    //     this.reloadRoute(uuid)
    //     return
    //   }

    //   if (index === 0) {
    //     if (this.history.length > 0) {
    //       const uuid = this.history[0].uuid
    //       this.active = uuid
    //       this.reloadRoute(uuid)
    //     }
    //   }

    //   if (index > this.history.length) {
    //     const uuid = this.history[this.history.length - 1].uuid
    //     this.active = uuid
    //     this.reloadRoute(uuid)
    //   }
    // },

    async setActive(uuid: number) {
      this.active = uuid
      return await this.reloadRoute(uuid)
    },

    getMidjourneyByUuidAndIndex(uuid: number, index: number) {
      if (!uuid || uuid === 0) {
        if (this.midjourney.length)
          return this.midjourney[0].data[index]
        return null
      }
      const midjourneyIndex = this.midjourney.findIndex(item => item.uuid === uuid)
      if (midjourneyIndex !== -1)
        return this.midjourney[midjourneyIndex].data[index]
      return null
    },

    addMidjourneyByUuid(uuid: number,midjourney: Midjourney.Midjourney) {
      if (!uuid || uuid === 0) {
        if (this.midjourney.length === 0) {
            // const uuid = Date.now()
            this.midjourney.unshift({ uuid, data: [midjourney] })
            this.recordState()
        }
        this.midjourney[0].data.unshift(midjourney)
        this.recordState()
      }
      const index = this.midjourney.findIndex(item => item.uuid === uuid)
      if (index !== -1) {
        this.midjourney[index].data.unshift(midjourney)
        this.recordState()
      }
    },

    updateMidjourneyByUuid(uuid: number, index: number, midjourney: Midjourney.Midjourney) {
      if (!uuid || uuid === 0) {
        if (this.midjourney.length) {
          this.midjourney[0].data[index] = midjourney
          this.recordState()
        }
        return
      }

      const midjourneyIndex = this.midjourney.findIndex(item => item.uuid === uuid)
      if (midjourneyIndex !== -1) {
        this.midjourney[midjourneyIndex].data[index] = midjourney
        this.recordState()
      }
    },

    updateMidjourneySomeByUuid(uuid: number, index: number, midjourney: Partial<Midjourney.Midjourney>) {
      if (!uuid || uuid === 0) {
        if (this.midjourney.length) {
          this.midjourney[0].data[index] = { ...this.midjourney[0].data[index], ...midjourney }
          this.recordState()
        }
        return
      }

      const midjourneyIndex = this.midjourney.findIndex(item => item.uuid === uuid)
      if (midjourneyIndex !== -1) {
        this.midjourney[midjourneyIndex].data[index] = { ...this.midjourney[midjourneyIndex].data[index], ...midjourney }
        this.recordState()
      }
    },

    deleteMidjourneyByUuid(uuid: number, index: number) {
      if (!uuid || uuid === 0) {
        if (this.midjourney.length) {
          this.midjourney[0].data.splice(index, 1)
          this.recordState()
        }
        return
      }

      const midjourneyIndex = this.midjourney.findIndex(item => item.uuid === uuid)
      if (midjourneyIndex !== -1) {
        this.midjourney[midjourneyIndex].data.splice(index, 1)
        this.recordState()
      }
    },

    clearMidjourneyByUuid(uuid: number) {
      if (!uuid || uuid === 0) {
        if (this.midjourney.length) {
          this.midjourney[0].data = []
          this.recordState()
        }
        return
      }

      const index = this.midjourney.findIndex(item => item.uuid === uuid)
      if (index !== -1) {
        this.midjourney[index].data = []
        this.recordState()
      }
    },
    
    resetSetting() {
      this.$state = defaultState()
      // removeLocalState()
    },
    updateMidjourney(midjourney: Partial<Midjourney.MidjourneyState>) {
      this.$state = { ...this.$state, ...midjourney }
      this.recordState()
    },
    setCarryParam(carryParam:boolean) {
      this.carryParam = !carryParam
      this.recordState()
    },
    setAspect(aspect: Aspect) {
      if (this.aspect !== aspect) {
        this.aspect = aspect
        this.recordState()
      }
    },
    setDrawModel(drawModel: DrawModel) {
      if (this.drawModel !== drawModel) {
        this.drawModel = drawModel
        this.recordState()
      }
    },
    setStylize(stylize: Stylize) {
      if (this.stylize !== stylize) {
        this.stylize = stylize
        this.recordState()
      }
    },
    setDrawQuality(drawQuality: DrawQuality) {
      if (this.drawQuality !== drawQuality) {
        this.drawQuality = drawQuality
        this.recordState()
      }
    },
    
    async reloadRoute(uuid?: number) {
      this.recordState()
      await router.push({ name: 'midjourney', params: { uuid } })
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})
