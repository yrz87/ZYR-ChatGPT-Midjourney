<script setup lang='ts'>
import type { CSSProperties } from "vue";
import { computed, watch } from "vue";
import { NLayoutSider,NTooltip,NAvatar } from "naive-ui";
import { useRouter } from 'vue-router'
import type { NavType } from '@/store/modules/settings/helper'
import { useAppStore,useSettingStore } from "@/store";
import { useBasicLayout } from "@/hooks/useBasicLayout";
import { SvgIcon } from "@/components/common";
import defaultAvatar from '@/assets/avatar.jpg'
const router = useRouter()
const appStore = useAppStore();
const settingStore = useSettingStore();

const { isMobile } = useBasicLayout();

// const navType = computed(() => settingStore.navType)


const getMobileClass = computed<CSSProperties>(() => {
  if (isMobile.value) {
    return {
      position: "fixed",
      zIndex: 50,
    };
  }
  return {};
});

// const mobileSafeArea = computed(() => {
//   if (isMobile.value) {
//     return {
//       paddingBottom: "env(safe-area-inset-bottom)",
//     };
//   }
//   return {};
// });

watch(
  isMobile,
  (val) => {
    appStore.setSiderCollapsed(val);
  },
  {
    immediate: true,
    flush: "post",
  }
);
function handleNav(key:NavType) {
  console.log(key);
  settingStore.setNavType(key)
  router.push({ name: key});
  // router.replace({name: key})
}

const navTypeOptions: { label: string; key: NavType; name: string;icon: string; }[] = [
  {
    label: 'AI对话聊天',
    name: 'chat',
    key: 'ChatGPT',
    icon: 'ri:message-3-line',
  },
  {
    label: 'Midjourney-Ai专业版绘画',
    name: 'midjourney',
    key: 'Midjourney',
    icon: 'ion:game-controller-outline',
  },
  {
    label: 'DALL·E2基础版绘画',
    name: 'drawer',
    key: 'Daller2',
    icon: 'ion:color-palette-outline'
  },
  {
    label: 'AI绘画广场',
    name: 'gallery',
    key: 'Gallery',
    icon: 'ri:moon-foggy-line',
  },
  {
    label: 'AI思维导图',
    name: 'mind-map',
    key: 'MindMap',
    icon: 'iconoir:3d-add-hole',
  },
]
</script>

<template>
  <NLayoutSider
    :width="72"
    bordered
    :style="getMobileClass"
  >
  
    <div class="n-layout-sider-scroll-container" style="min-width: 72px; overflow: auto">
      <div class="flex h-full flex-col items-center justify-between bg-[#e8eaf1] px-2 py-4 dark:bg-[#25272d]"> 
        <div class="flex flex-col space-y-4">
          <template v-for="item of navTypeOptions" :key="item.key">
            <div class="h-12 w-12 cursor-pointer rounded-xl bg-white duration-300 dark:bg-[#34373c]"  @click="handleNav(item.key)">
                <div class="flex h-full">
                  <div class="m-auto text-center">
                    <NTooltip placement="right" trigger="hover">
                      <template #trigger>
                        <SvgIcon class="text-xl" :icon="item.icon"/>
                      </template>
                      <div class="large-text">
                        {{ item.name }}
                      </div>
                    </NTooltip>
                  </div>
                </div>
            </div>
          </template>    
        </div>
        <!-- 放入头像及设置按钮 -->
        <NAvatar size="large" round :src="defaultAvatar" />
      </div>
      
   </div>
   </NLayoutSider>
</template>
