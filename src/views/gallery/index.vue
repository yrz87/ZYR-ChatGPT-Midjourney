<script setup lang='ts'>
import {
  NInput,
  NImage
} from "naive-ui";

import {mjTaskListByCondition } from "@/api/midjourney";
let images = [{src:"",width:"",height:""}];
let ids = "7065673682792769,0322025056247759";
const resJson = await mjTaskListByCondition({ ids });
console.log(resJson);
</script>

<template>
  <div class="p-4 space-y-4">
    <h2 class="text-xl font-bold">画廊</h2>
    
      <NInput
        ref="inputRef"
        type="textarea"
        placeholder="搜索prompt提示或关键词"
      />
    
    <div class="waterfall">
      <div v-for="(image, index) in images" :key="index" class="waterfall-item">
        <NImage :src="image.src" :width="image.width" :height="image.height" />
      </div>
    </div>


    
  </div>
</template>

<style scoped>
.waterfall {
  column-count: 4;
  column-gap: 10px;
}

.waterfall-item {
  break-inside: avoid;
  padding: 5px;
  box-sizing: border-box;
}
</style>

