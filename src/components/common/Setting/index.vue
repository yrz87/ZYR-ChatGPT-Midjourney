<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NTabPane, NTabs } from 'naive-ui'
import General from './General.vue'
import SetToken from './SetToken.vue'
import Advanced from './Advanced.vue'

import About from './About.vue'
import { useAuthStore } from '@/store'
import { SvgIcon } from '@/components/common'

// interface Props {
//   visible: boolean
// }

// interface Emit {
//   (e: 'update:visible', visible: boolean): void
// }

// const props = defineProps<Props>()

// const emit = defineEmits<Emit>()

const authStore = useAuthStore()

const isChatGPTAPI = computed<boolean>(() => !!authStore.isChatGPTAPI)

//默认开启SetToken窗口--设置密钥
const active = ref('SetToken')

// const show = computed({
//   get() {
//     return props.visible
//   },
//   set(visible: boolean) {
//     emit('update:visible', visible)
//   },
// })
</script>

<template>
  
  <!-- <NModal v-model:show="show" :auto-focus="false" preset="card" style="width: 95%; max-width: 640px"> -->
    <div class="min-h-full p-8">
      <header class="mb-4"><h2 class="mb-2 text-2xl font-bold text-black dark:text-white">个人中心</h2></header>
      <NTabs v-model:value="active" type="line" animated>
        <NTabPane name="General" tab="General">
          <template #tab>
            <SvgIcon class="text-lg" icon="ri:file-user-line" />
            <span class="ml-2">{{ $t('setting.general') }}</span>
          </template>
          <div class="min-h-[100px]">
            <General />
          </div>
        </NTabPane>
        <NTabPane name="General" tab="General">
          <template #tab>
            <SvgIcon class="text-lg" icon="ri:file-user-line" />
            <span class="ml-2">账户</span>
          </template>
          <div class="min-h-[100px]">
            <General />
          </div>
        </NTabPane>

        <NTabPane v-if="isChatGPTAPI" name="SetToken" tab="SetToken">
          <template #tab>
            <SvgIcon class="text-lg" icon="ri:equalizer-line" />
            <span class="ml-2">{{ $t('setting.setToken') }}</span>
          </template>
          <div class="min-h-[100px]">
            <SetToken />
          </div>
        </NTabPane>
        
        
        <NTabPane v-if="isChatGPTAPI" name="Advanced" tab="Advanced">
          <template #tab>
            <SvgIcon class="text-lg" icon="ri:equalizer-line" />
            <span class="ml-2">{{ $t('setting.advanced') }}</span>
          </template>
          <div class="min-h-[100px]">
            <Advanced />
          </div>
        </NTabPane>
        <NTabPane name="Config" tab="Config">
          <template #tab>
            <SvgIcon class="text-lg" icon="ri:list-settings-line" />
            <span class="ml-2">{{ $t('setting.config') }}</span>
          </template>
          <About />
        </NTabPane>
      </NTabs>
    </div>
  <!-- </NModal> -->
</template>
