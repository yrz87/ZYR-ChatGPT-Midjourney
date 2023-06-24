<script setup lang='ts'>
</script>

<template>
  <div class="p-4 space-y-4">
    <h2 class="text-xl font-bold">AI绘画</h2>
    <!-- <img src="http://localhost:3002/attachments/1119918876113764393/1121350142595965048/morganlisa_4019753687806840_a_yellow_pig_c748bd97-4528-44b5-9313-6a6eef1ca10e.png" /> -->
    <div class="flex items-center space-x-4">你想生成什么风格或类型图像？</div>
    
    <!-- </NUpload> -->
    <!-- <NButton @click="removeFirstImage">Remove First Image</NButton> -->
    <!-- </NImageGroup> -->
    <div class="items-center space-x-4">
      <!-- <div class="flex flex-wrap items-center gap-4">
        <template v-for="item of imgageTypeOptions" :key="item.key">
          <NButton
            size="small"
            :type="item.key === imgageType ? 'primary' : undefined"
            @click="setImgageType(item.key)"
          >
            {{ item.label }}
          </NButton>
        </template>
      </div> -->
      <div class="flex-wrap items-center">
        提示：垫图模式/识图(describe)模式只会使用第一张图片，混图(blend)模式会按顺序使用选中的两张图片（点击图片可以移除）
      </div>
    </div>
    
    <div>
      <div class="flex items-center justify-between">
        <p>生成提示词</p>
        <!-- <NButton size="small" type="success">翻译</NButton> -->
      </div>
      <!-- <NInput
        ref="inputRef"
        v-model:value="prompt"
        type="textarea"
        :disabled="imgageType == 'BLEND' || imgageType == 'DESCRIBE'"
        :placeholder="placeholder"
        :autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }"
      /> -->
    </div>
    <div class="p-2 space-y-2 rounded-md bg-neutral-100 dark:bg-neutral-700">
      <div class="text-lg font-bold">参数设置:<text style="color: red"></text>
      </div>
      <div class="text-xl font-bold">
        获取密钥链接:
        <a
          class="text-blue-600 dark:text-blue-500"
          href=""
          target="_blank"
        >
          
        </a>
      </div>
      <p style="color: red">如有疑问或者需要帮助,请联系客服QQ：657008145</p>
    </div>
  </div>
</template>