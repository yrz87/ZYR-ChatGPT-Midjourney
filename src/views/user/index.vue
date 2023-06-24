

<script setup lang='ts'>
import { ref } from 'vue'
import { Setting } from '@/components/common'

const show = ref(true);
</script>

<template>
  <div>
    <Setting v-if="show" v-model:visible="show" />
  </div>
</template>