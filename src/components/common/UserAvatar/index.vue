<script setup lang='ts'>
import { computed,Ref} from 'vue'
import { useTokenStore } from '@/store'
// import { NAvatar } from 'naive-ui'
// import { useUserStore } from '@/store'
// import defaultAvatar from '@/assets/avatar.jpg'
// import { isString } from '@/utils/is'
const tokenStore = useTokenStore()
const authInfo = computed(() => tokenStore.authInfo)
const surplusNum: Ref<number> = computed(() => authInfo.value.surplusNum)
const openFreeNum = computed(() => authInfo.value.openFreeNum)
const tokenVerification = computed(() => authInfo.value.tokenVerification)
const freeNum = computed(() => authInfo.value.freeNum)
const expressDate = computed(() => authInfo.value.expressDate)
</script>

<template>
  <div class="flex items-center overflow-hidden">
    <!-- <div class="w-10 h-10 overflow-hidden rounded-full shrink-0">
      <template v-if="isString(userInfo.avatar) && userInfo.avatar.length > 0">
        <NAvatar
          size="large"
          round
          :src="userInfo.avatar"
          :fallback-src="defaultAvatar"
        />
      </template>
      <template v-else>
        <NAvatar size="large" round :src="defaultAvatar" />
      </template>
    </div>
    <div class="flex-1 min-w-0 ml-2">
      <h2 class="overflow-hidden font-bold text-md text-ellipsis whitespace-nowrap">
        {{ userInfo.name ?? 'ChenZhaoYu' }}
      </h2>
      <p class="overflow-hidden text-xs text-gray-500 text-ellipsis whitespace-nowrap">
        <span
          v-if="isString(userInfo.description) && userInfo.description !== ''"
          v-html="userInfo.description"
        />
      </p>
    </div> -->

    <div class="flex-1 min-w-0">
      <h2 class="overflow-hidden text-xs text-gray-500 text-ellipsis whitespace-nowrap" style="cursor:pointer;">
        客服QQ：657008145
      </h2>
      <h2 class="overflow-hidden font-bold text-md text-ellipsis whitespace-nowrap" v-if="freeNum>0 && openFreeNum && !tokenVerification">
        <span>免费试用次数:<span style="color:red">{{freeNum}}</span></span>
      </h2>
      <h2 class="overflow-hidden font-bold text-md text-ellipsis whitespace-nowrap" v-if="authInfo.userIdentify == 0">
        <span>VIP剩余积分为:<span style="color:red">{{surplusNum}}</span></span>
      </h2>
      <h2 class="overflow-hidden font-bold text-md text-ellipsis whitespace-nowrap" v-if="authInfo.userIdentify == 1">
        <span>VIP到期时间为:<span style="color:red">{{expressDate}}</span></span>
      </h2>
      <!-- {{authInfo.freeNum}}--{{authInfo.openFreeNum}}
      {{authInfo.tokenVerification}} -->
      <h2 class="overflow-hidden text-xs text-gray-500 text-ellipsis whitespace-nowrap">
        <span><span style="color:red">密钥:</span>{{authInfo.systemToken}}</span>
      </h2>
      <!-- <h2 class="overflow-hidden font-bold text-md text-ellipsis whitespace-nowrap">
        <span><a href="https://www.explainthis.io/zh-hans/chatgpt">👉 ChatGPT 指令大全</a></span>
      </h2> -->
      <!-- <h2 class="overflow-hidden font-bold text-md text-ellipsis whitespace-nowrap">
        <span @click="aa">修改剩余次数</span>
      </h2> -->
      <!-- <p class="overflow-hidden text-xs text-gray-500 text-ellipsis whitespace-nowrap">
        <span><span style="color:red">密钥:</span>{{systemToken}}</span>
      </p> -->
      <!-- <a class="overflow-hidden text-xs text-gray-500 text-ellipsis whitespace-nowrap" target="_blank" href="{{getTokenUrl}}">
        获取密钥
      </a> -->
    </div>
  </div>
</template>
