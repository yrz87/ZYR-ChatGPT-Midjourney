<script setup lang='ts'>
import {computed,ref } from "vue";
import {
  NEmpty,
  NButton,
  NPopover,
  NPagination
} from "naive-ui";
import { SvgIcon } from "@/components/common";
import { useMidjourneyStore } from "@/store";
import { useRoute } from "vue-router";
const midjourneyStore = useMidjourneyStore();
const route = useRoute();

const { uuid } = route.params as { uuid: string };

// 创建响应式引用
let page = ref(1);
let pageSize = ref(8);

let dataSources = computed(() => midjourneyStore.getMidjourneyByPage(+uuid, page.value, pageSize.value));
const dataSourcesLength = computed(() => midjourneyStore.getMidjourneyByUuidLength(+uuid));

function onPageChange(newPage: number) {
  page.value = newPage;
}

function useToPrompt(val: string) {
  prompt.value = val;
}
</script>

<template>
  <div>
    <template v-if="dataSources.length == 0">
      <NEmpty description="暂无任务" show-icon=""></NEmpty>
    </template>
    <!--  -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      style="font-family: cursive"
    >
      <div
        class="relative overflow-hidden rounded-md border p-4 transition-all hover:shadow dark:border-neutral-700"
        v-for="(item, index) of dataSources"
        :key="index"
      >
        <div class="flex items-center justify-between">
          <NButton
            round
            size="small"
            type="primary"
            tag="text"
            ghost
            >{{ returnStatus(item.status) }}</NButton
          >

          <NPopover style="max-width: 400px" placement="top"  trigger="hover">
            <template #trigger>
              <NButton
                size="small"
                @click="useToPrompt(item.requestOptions.prompt)"
                v-if="!(item.action == 'UPSCALE') && item.finished"
                ><SvgIcon icon="ion:brush-outline" />使用</NButton
              >
            </template>
            <div class="large-text">{{item.requestOptions.prompt}}</div>
          </NPopover>
          <NButton
            size="small"
            @click="downloadImage(item.imgUrl)"
            v-if="item.status == 'SUCCESS' && item.imgUrl"
            ><SvgIcon icon="ion:download-outline" />下载</NButton
          >
          <NButton size="small" @click="deleteByIndex(index)"><SvgIcon icon="ri:delete-bin-line" />删除</NButton>
        </div>
        <div class="my-4 h-[280px]" v-if="item.finished">
          <div
            class="flex h-full w-full items-center justify-center overflow-hidden rounded-md"
          >
            <div role="none" class="n-image" v-if="item.imgUrl">
              <img
                :src="item.imgUrl"
                :data-preview-src="item.imgUrl"
                loading="lazy"
                data-error="false"
                data-group-id=""
                style="object-fit: contain"
              />
            </div>
            <div class="flex items-center space-x-4" v-else>
              <div class="flex items-center space-x-4">
                <SvgIcon
                  class="flex items-center space-x-4 text-xl"
                  icon="twemoji:anxious-face-with-sweat"
                  v-if="item.status == 'FAILURE' || item.status == 'FAILED'"
                />
                <SvgIcon v-else class="text-xl" icon="fxemoji:rocket" />
              </div>
              <div class="flex items-center space-x-4">
                <text v-if="item.status == 'FAILURE'">错误信息：</text>
                {{ item.content }}
              </div>
            </div>
          </div>
        </div>
        <div class="my-4 h-[280px]" v-else>
          <div
            class="flex h-full w-full items-center justify-center overflow-hidden rounded-md"
          >
            <SvgIcon class="text-xl" icon="svg-spinners:blocks-wave" />
            <div class="flex items-center space-x-4">
              <span class="flex-shrink-0" v-if="item.status == 'NOT_START'"
                >排队中...</span
              >
              <span class="flex-shrink-0" v-if="item.status == 'IN_PROGRESS'">
                <div>执行中...</div>
                <div>{{ item.progress }}</div>
              </span>
            </div>
          </div>
        </div>
        <div
          class="-mx-4 -mb-4 flex items-start bg-[#fafafc] px-4 py-2 dark:bg-[#262629]"
        >
          <div class="flex-1">
            <div>
              <div class="mb-2 flex items-center justify-between">
                <span>放大：</span>
                <NTooltip placement="right" trigger="hover">
                  <template #trigger>
                    <SvgIcon icon="ion:alert-circle-outline" />
                  </template>
                  <div class="large-text">参数释义：放大某张图片
                    如 U1 放大第一张图片，以此类推
                  </div>
                </NTooltip>
                <div class="flex-1">
                  <div class="flex items-center justify-around">
                    <NButton
                      size="small"
                      :disabled="!item.finished || !item.imgUrl"
                      @click="handleButtonClick('UPSCALE', item.taskId, 1)"
                      >U1</NButton
                    >
                    <NButton
                      size="small"
                      :disabled="!item.finished || !item.imgUrl"
                      @click="upscale(item.taskId, 2)"
                      >U2</NButton
                    >
                    <NButton
                      size="small"
                      :disabled="!item.finished || !item.imgUrl"
                      @click="upscale(item.taskId, 3)"
                      >U3</NButton
                    >
                    <NButton
                      size="small"
                      :disabled="!item.finished || !item.imgUrl"
                      @click="upscale(item.taskId, 4)"
                      >U4</NButton
                    >
                  </div>
                </div>
              </div>
              <div class="mb-2 flex items-center justify-between">
                <span>变换：</span>
                <NTooltip placement="right" trigger="hover">
                  <template #trigger>
                    <SvgIcon icon="ion:alert-circle-outline" />
                  </template>
                  <div class="large-text">参数释义：以某张图片为基准重新生成
                    如 V1 则变换第一张图片，以此类推</div>
                </NTooltip>
                <div class="flex-1">
                  <div class="flex items-center justify-around">
                    <NButton
                      size="small"
                      :disabled="!item.finished || !item.imgUrl"
                      @click="variation(item.taskId, 1)"
                      >V1</NButton
                    >
                    <NButton
                      size="small"
                      :disabled="!item.finished || !item.imgUrl"
                      @click="variation(item.taskId, 1)"
                      >V2</NButton
                    >
                    <NButton
                      size="small"
                      :disabled="!item.finished || !item.imgUrl"
                      @click="variation(item.taskId, 1)"
                      >V3</NButton
                    >
                    <NButton
                      size="small"
                      :disabled="!item.finished || !item.imgUrl"
                      @click="variation(item.taskId, 1)"
                      >V4</NButton
                    >
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between text-slate-500">
                <span>时间：{{ item.dateTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <NPagination
      :display-order="['quick-jumper', 'pages', 'size-picker']"
      v-model:page="page"
      v-model:pageSize="pageSize"
      :page-sizes="[5, 10, 15, 20]"
      :item-count="dataSourcesLength"
      show-quick-jumper
      show-size-picker
      @update:page="onPageChange"
    ></NPagination>
    
  </div>
</template>
