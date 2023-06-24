<script lang="ts" setup>
import { computed } from "vue";
import {
  NButton,
  NImage,
  // NInput,
  // NPopconfirm,
  NSelect,
  // useMessage,
  NSwitch,
  NInputNumber,
  NTooltip,
} from "naive-ui";
import type {
  // Language,
  Aspect,
  DrawModel,
  Stylize,
  DrawQuality,
} from "@/store/modules/midjourney/helper";
import { SvgIcon } from "@/components/common";
import { useMidjourneyStore } from "@/store";
// import { useBasicLayout } from "@/hooks/useBasicLayout";
// import { t } from "@/locales";
import NIJIImg from "@/assets/B740D8636B8CA3D87DF6C6D19F830E62-01.png";
import MidImg from "@/assets/6A4DF93742A82A8CA72CFBF4BECCD6F8-01.png";
const midjourneyStore = useMidjourneyStore();
// const userStore = useUserStore();

// const { isMobile } = useBasicLayout();

// const ms = useMessage();

const aspect = computed(() => midjourneyStore.aspect);
const drawModel = computed(() => midjourneyStore.drawModel);
const stylize = computed(() => midjourneyStore.stylize);
const drawQuality = computed(() => midjourneyStore.drawQuality);
const carryParam = computed(() => midjourneyStore.carryParam);
const drawModelOptions: { label: string; key: DrawModel; image: string }[] = [
  {
    label: "MJ",
    key: "Midjourney",
    image: MidImg,
  },
  {
    label: "NIJI",
    key: "NIJI",
    image: NIJIImg,
  },
];

const drawQualityOptions: { label: string; key: DrawQuality; image: string }[] =
  // [
  //   {
  //     label: "一般",
  //     key: "",
  //     image: MidImg,
  //   },
  //   {
  //     label: "真实感",
  //     key: "Quixel Megascans Render",
  //     image: MidImg,
  //   },
  //   {
  //     label: "全高清",
  //     key: "FHD",
  //     image: MidImg,
  //   },
  //   {
  //     label: "1080P",
  //     key: "1080P",
  //     image: MidImg,
  //   },{
  //     label: "4K",
  //     key: "4K",
  //     image: MidImg,
  //   },{
  //     label: "8K",
  //     key: "8K",
  //     image: MidImg,
  //   },
  //   {
  //     label: "高细节",
  //     key: "high detail",
  //     image: NIJIImg,
  //   },
  //   {
  //     label: "高品质",
  //     key: "hyper quality",
  //     image: MidImg,
  //   },
  //   {
  //     label: "高分辨率",
  //     key: "high resolution",
  //     image: NIJIImg,
  //   },
  // ];
  [
    {
      label: "一般",
      key: "low",
      image: MidImg,
    },
    {
      label: "清晰",
      key: "med",
      image: MidImg,
    },
    {
      label: "高清",
      key: "high",
      image: MidImg,
    },
    {
      label: "超高清",
      key: "very high",
      image: MidImg,
    },
  ];

const StylizeOptions: { label: string; key: Stylize; image: string }[] = [
  {
    label: "低",
    key: 50,
    image: MidImg,
  },
  {
    label: "中",
    key: 100,
    image: NIJIImg,
  },
  {
    label: "高",
    key: 250,
    image: MidImg,
  },
  {
    label: "强烈",
    key: 750,
    image: NIJIImg,
  },
];
const aspectOptions: {
  label: string;
  key: Aspect;
  style: string;
}[] = [
  {
    key: "1:1",
    label: "one-one",
    style: "width: 100%; height: 100%;",
  },
  {
    key: "4:3",
    label: "four-three",
    style: "width: 100%; height: 75%;",
  },
  {
    key: "3:4",
    label: "three-four",
    style: "width: 75%; height: 100%;",
  },
  {
    key: "16:9",
    label: "sixteen-nine",
    style: "width: 100%; height: 57%;",
  },
  {
    key: "9:16",
    label: "nine-sixteen",
    style: "width: 57%; height: 100%;",
  },
];

function handleReset() {
  midjourneyStore.resetSetting();
}
</script>

<template>
  <div class="p-4 space-y-5 min-h-200">
    <div class="space-y-6">
      <div class="mb-4 flex items-center text-sm">
        <span class="mr-1 text-sm">图片比例</span>
        <NTooltip placement="top" trigger="hover">
          <template #trigger>
            <SvgIcon icon="ion:alert-circle-outline" />
          </template>
          <div class="large-text">参数释义：生成图片尺寸比例</div>
        </NTooltip>
      </div>

      <div class="flex mt-2 py-1 pb-2 space-x-1 justify-between scrollbar-none">
        <template v-for="item of aspectOptions" :key="item.key">
          <div class="flex-1 p-[2px] rounded-md"  @click="midjourneyStore.setAspect(item.key)">
            <div class="box-borde rounded-md dark:bg-black flex flex-col items-center py-2 border-2" :class="item.key === aspect ? 'active' : 'border-gray-300'" >
              <div class="flex items-center justify-center w-6 h-6">
                <div class="rounded border-2" :class="item.key === aspect ? 'active' : 'border-gray-300'" :style="item.style"></div>
              </div>
              <div class="mt-2 text-center text-xs leading-none text-current ">{{ item.key }}</div>
            </div>
          </div>
        </template>
      </div>

      <div>
        <div class="mb-4 flex items-center text-sm">
          <span class="flex-shrink-0">模型选择</span>
          <NTooltip placement="top" trigger="hover">
            <template #trigger>
              <SvgIcon icon="ion:alert-circle-outline" />
            </template>
            <div class="large-text">MJ：通用模型</div>
            <div class="large-text">NIJI：动漫风格模型</div>
          </NTooltip>
        </div>
        <ul class="version space-x-2">
          
          <template v-for="item of drawModelOptions" :key="item.key">
            <!-- :class="{ active: item.key == drawModel }" -->
            <li class="version-item"  @click="midjourneyStore.setDrawModel(item.key)">
              <div class="relative overflow-hidden rounded-md border-4 " :class="item.key === drawModel ? 'active' : 'dark:border-neutral-700'">
                <span class="absolute flex h-full w-full items-center justify-center bg-black/20"
                  ><span class="text-lg font-bold text-white">{{ item.label }}</span>
                </span>
                <NImage width="100" :src="item.image" />
              </div>
            </li>
          </template>
        </ul>

      </div>

      <!-- <div class="flex items-center space-x-4">
        <span class="flex-shrink-0">版本</span>
        <div class="flex flex-wrap items-center gap-4">
          <NSelect
            style="width: 140px"
            :value="language"
            :options="languageOptions"
            @update-value="(value) => midjourneyStore.setLanguage(value)"
          />
        </div>
      </div> -->
      <!-- <div class="flex items-center space-x-4">
        <span class="flex-shrink-0">风格</span>
        <div class="flex flex-wrap items-center gap-4">
          <NSelect
            style="width: 140px"
            :value="language"
            :options="languageOptions"
            @update-value="(value) => midjourneyStore.setLanguage(value)"
          />
        </div>
      </div> -->
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0">参数</span>
        <NTooltip placement="top" trigger="hover">
          <template #trigger>
            <SvgIcon icon="ion:alert-circle-outline" />
          </template>
          <div class="large-text">设定绘画模型参数</div>
        </NTooltip>
      </div>
      


      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0">画质</span>
        <div class="flex flex-wrap items-center gap-4">
          <NSelect
            style="width: 140px"
            :value="drawQuality"
            :options="drawQualityOptions"
            @update-value="(value) => midjourneyStore.setDrawQuality(value)"
          />
        </div>
        <NTooltip placement="top" trigger="hover">
          <template #trigger>
            <SvgIcon icon="ion:alert-circle-outline" />
          </template>
          <div class="large-text">画质：--quality 或 --q</div>
          <div class="large-text">参数释义：更高质量需要更长的时间处理更多细节</div>
        </NTooltip>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0">混乱</span>
        
        <div class="w-[200px]">
          <NInputNumber v-model:value="midjourneyStore.chaos"/>
        </div>
        <NTooltip placement="top" trigger="hover">
          <template #trigger>
            <SvgIcon icon="ion:alert-circle-outline" />
          </template>
          <div class="large-text">混乱：--chaos 或 --c，范围 0-100</div>
          <div class="large-text">参数释义：较高值将产生意想不到的结果和成分</div>
          <div class="large-text">较低值具有更可靠、可重复的结果</div>
        </NTooltip>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0">风格化</span>
        <NTooltip placement="top" trigger="hover">
          <template #trigger>
            <SvgIcon icon="ion:alert-circle-outline" />
          </template>
          <div class="large-text">风格化：--stylize 或 --s，范围 1-1000</div>
          <div class="large-text">参数释义：数值越高，画面表现也会更具丰富性和艺术性</div>
        </NTooltip>
      </div>
    
      <div class="flex items-center space-x-4">
        <div class="flex flex-wrap items-center justify-center gap-4">
          <template v-for="item of StylizeOptions" :key="item.key">
            <NButton
              size="small"
              :type="item.key === stylize ? 'primary' : undefined"
              @click="midjourneyStore.setStylize(item.key)"
            >
              <div class="flex-shrink-0">{{ item.label }}</div>
            </NButton>
          </template>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <NInputNumber v-model:value="midjourneyStore.stylize" />
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0">设定</span>
      </div>
      <div class="flex items-center space-x-4">
          <span class="flex-shrink-0">携带参数</span>
          <NSwitch v-model:value="carryParam" @update:value="midjourneyStore.setCarryParam(carryParam)" />
          <NTooltip placement="top" trigger="hover">
            <template #trigger>
              <SvgIcon icon="ion:alert-circle-outline" />
            </template>
            <div class="large-text">是否自动携带参数</div>
            <div class="large-text">开启：使用设定参数</div>
            <div class="large-text">关闭：可在提示词框自行设定参数</div>
          </NTooltip>
          
      </div>
      
      
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0">默认参数</span>
        <NButton size="small" @click="handleReset">
          {{ $t("common.reset") }}
        </NButton>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0"
          >图片将定时清理，如需要保存您的图片。请自行保存</span
        >
      </div>
    </div>
  </div>
</template>
<style lang="less">
@import url(./style.less);
</style>
