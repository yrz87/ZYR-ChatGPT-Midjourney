import { useMidjourneyStore } from '@/store'

export function useMidjourney() {
  const midjourneyStore = useMidjourneyStore()

  const getMidjourneyByUuidAndIndex = (uuid: number, index: number) => {
    return midjourneyStore.getMidjourneyByUuidAndIndex(uuid, index)
  }

  const addMidjourney = (uuid: number, midjourney: Midjourney.Midjourney) => {
    midjourneyStore.addMidjourneyByUuid(uuid, midjourney)
  }

  const updateMidjourney = (uuid: number, index: number, midjourney: Midjourney.Midjourney) => {
    midjourneyStore.updateMidjourneyByUuid(uuid, index, midjourney)
  }

  const updateMidjourneySome = (uuid: number, index: number, midjourney: Partial<Midjourney.Midjourney>) => {
    midjourneyStore.updateMidjourneySomeByUuid(uuid, index, midjourney)
  }

  return {
    addMidjourney,
    updateMidjourney,
    updateMidjourneySome,
    getMidjourneyByUuidAndIndex,
  }
}
