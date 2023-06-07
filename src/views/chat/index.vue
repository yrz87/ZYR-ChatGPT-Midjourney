<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { NAutoComplete,NSelect, NButton, NInput, useDialog, useMessage } from 'naive-ui'
import html2canvas from 'html2canvas'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import { useUsingContext } from './hooks/useUsingContext'
import HeaderComponent from './components/Header/index.vue'
import { HoverButton, SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import HelpDoc from './layout/HelpDoc.vue'
import type { Model } from '@/store/modules/settings/helper'
import { Setting } from '@/components/common'
import {
  useChatStore,
  usePromptStore,
  useTokenStore,
  useSettingStore,
  useUserStore,
} from "@/store";
import { fetchChatAPIProcess } from '@/api'
import {generateImage,updateNumByToken } from "@/api/db";

import { t } from '@/locales'

let controller = new AbortController()

const openLongReply = import.meta.env.VITE_GLOB_OPEN_LONG_REPLY === 'true'

const route = useRoute()
const dialog = useDialog()
const ms = useMessage()

const chatStore = useChatStore()

const { isMobile } = useBasicLayout()
const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex } = useChat()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()
const { usingContext, toggleUsingContext } = useUsingContext()

const { uuid } = route.params as { uuid: string }
const dataSources = computed(() => chatStore.getChatByUuid(+uuid))
const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !!item.conversationOptions)))

const loading = ref<boolean>(false)
const inputRef = ref<Ref | null>(null)

// 添加PromptStore
const promptStore = usePromptStore()

// 使用storeToRefs，保证store修改后，联想部分能够重新渲染
const { promptList: promptTemplate } = storeToRefs<any>(promptStore)

const show = ref(false);

const userStore = useUserStore();

const userInfo = computed(() => userStore.userInfo);
userInfo.value.tryText = "";
let prompt = computed({
  get: () => userInfo.value.tryText,
  set: (newValue) => {
    userInfo.value.tryText = newValue;
  }
});

// 用户token 用户剩余次数 用户使用次数
const tokenStore = useTokenStore();
const authInfo = computed(() => tokenStore.authInfo);
const systemToken = computed(() => authInfo.value.systemToken);
const userIdentify = computed(() => authInfo.value.userIdentify);
// 假设你有一个 `ComputedRef<Ref<number>>` 类型的变量
const expressDateNumber = computed(() => {
  return ref(authInfo.value.expressDateNumber);
});
const surplusNum = computed(() => authInfo.value.surplusNum);
// const openFreeNum = computed(() => ref(authInfo.value.openFreeNum));
const openFreeNum = computed(() => authInfo.value.openFreeNum)
const tokenVerification = computed(() => authInfo.value.tokenVerification)
const freeNum = computed(() => authInfo.value.freeNum);

const settingStore = useSettingStore();

const model = computed({
  get() {
    return settingStore.model
  },
  set(value: Model) {
    settingStore.setModel(value)
  },
})
const modelOptions: { label: string; key: Model; value: Model}[] = [
  { label:"ChatGPT-3.5",key:'gpt-3.5-turbo',value:'gpt-3.5-turbo'},
  { label:"ChatGPT-4",key:'gpt-4',value:'gpt-4'},
  { label:"Daller2",key:"Daller2",value:'Daller2'}
]
function correctAccess() {
  if (openFreeNum.value && !tokenVerification.value) {
    if (freeNum.value > 0) {
      tokenStore.updateSetting({
        freeNum: freeNum.value - 1,
      });
      return;
    } else {
      const message =
        "您的免费次数为" +
        freeNum.value +
        ",如果想继续使用,请获取密钥:" +
        authInfo.value.getTokenUrl;
      addChatByMessage(message);
      return;
    }
  } else {
    if(authInfo.value.userIdentify == 1){//包月
      if(settingStore.model == 'gpt-4'){
        tokenStore.updateSetting({
          vipToGpt4Num:authInfo.value.vipToGpt4Num - 1
        });//将剩余次数,已经使用次数放入缓存
      }
    }else if(authInfo.value.userIdentify == 0){//购买次数
      if(settingStore.model == 'gpt-4'){
        tokenStore.updateSetting({
          surplusNum:authInfo.value.surplusNum - 10,
          useNum:authInfo.value.useNum + 10
        });//将剩余次数,已经使用次数放入缓存
      }else{
        tokenStore.updateSetting({
          surplusNum:authInfo.value.surplusNum - 1,
          useNum:authInfo.value.useNum + 1
        });//将剩余次数,已经使用次数放入缓存
      }
    }
    updateByToken(0); //数据库数据-1
  }
}

function errorAccess() {
  if (freeNum.value > 0 && openFreeNum.value && !tokenVerification.value) {
    if(settingStore.model == 'gpt-4'){
      tokenStore.updateSetting({
        freeNum: freeNum.value + 10,
      });
    }else{
      tokenStore.updateSetting({
        freeNum: freeNum.value + 1,
      });
    }
    return;
  } else {
    if(authInfo.value.userIdentify == 1){//包月
      if(settingStore.model == 'gpt-4'){
        tokenStore.updateSetting({
          vipToGpt4Num:authInfo.value.vipToGpt4Num + 1
        });//将剩余次数,已经使用次数放入缓存
      }
    }else if(authInfo.value.userIdentify == 0){//购买次数
      // 在数据库链接处理
      if(settingStore.model == 'gpt-4'){
        tokenStore.updateSetting({
          surplusNum:authInfo.value.surplusNum + 10,
          useNum:authInfo.value.useNum - 10
        });//将剩余次数,已经使用次数放入缓存
      }else{
        tokenStore.updateSetting({
          surplusNum:authInfo.value.surplusNum + 1,
          useNum:authInfo.value.useNum - 1
        });//将剩余次数,已经使用次数放入缓存
      }
    }
    updateByToken(1); //数据库数据+1
  }
}
interface ResponseData {
  data: {
    useNum: number;
    surplus: number;
    // 如果需要，您还可以添加其他属性
  };
  message: string;
  success: boolean;
}
type GenerateImageResponse = {
  data: string;
  message: string;
  success: boolean;
};


async function updateByToken<T = any>(type:number) {
  try {
    const response = (await updateNumByToken({
      userIdentify:userIdentify.value,
      token: systemToken.value,
      version: settingStore.model,
      question: prompt.value,
      type: type,
    })) as ResponseData;
    if (response && response.success) {
      tokenStore.updateSetting({
        surplusNum: response.data.surplus,
        useNum: response.data.useNum,
      }); //将剩余次数,已经使用次数放入缓存
    } else {
      console.error("failed:", response.message);
    }
  } catch (error) {
    console.log("error:", error);
  }
}
//如果开启免费试用次数 && 没有token的时候
if (freeNum.value > 0 && openFreeNum.value && !tokenVerification.value) {
  init();
}

function init() {
  if (freeNum.value > 0) {
    //免费次数为0,则不提示
    const message =
      "您好,欢迎使用ChatGPT智能聊天系统,提供给您" +
      freeNum.value +
      "次试用机会,如果您想继续使用,请获取密钥" +
      authInfo.value.getTokenUrl;
    addChatByMessage(message);
  }
}
function addChatByMessage(message: string) {
  addChat(+uuid, {
    dateTime: new Date().toLocaleString(),
    text: message,
    inversion: false, //true代表自己,false代表对方
    error: false,
    loading: false,
    isImg: false,
    conversationOptions: null,
    requestOptions: { prompt: message, options: null },
  });
  scrollToBottom();
}
async function generateImages(val: string) {
  try {
    const response = (await generateImage({
      prompt: val
    })) as GenerateImageResponse;
    if (response && response.success) {
      let message = response.data;
      updateChat(+uuid, dataSources.value.length - 1, {
        dateTime: new Date().toLocaleString(),
        text: message,
        inversion: false, //true代表自己,false代表对方
        error: false,
        loading: false,
        isImg: true,
        conversationOptions: null,
        requestOptions: { prompt: message, options: null },
      });
      scrollToBottom();
    } else {
      errorAccess();
      errorImgLoadingFalse("图片生成过程中出错了,请稍后再试!");
      console.error("failed:", response);
    }
  } catch (error) {
    errorAccess();
    errorImgLoadingFalse("图片生成过程中出错了,请稍后再试!");
    console.error("出错,减回去扣减的次数:", error);
  }
}
function errorImgLoadingFalse(message:string){
  updateChat(+uuid, dataSources.value.length - 1, {
    dateTime: new Date().toLocaleString(),
    text: message,
    inversion: false, //true代表自己,false代表对方
    error: false,
    loading: false,
    isImg: false,
    conversationOptions: null,
    requestOptions: { prompt: message, options: null },
  });
}

// 未知原因刷新页面，loading 状态不会重置，手动重置
dataSources.value.forEach((item, index) => {
  if (item.loading)
    updateChatSome(+uuid, index, { loading: false })
})

function handleSubmit() {
  onConversation()
}
async function onConversation() {
  let message = prompt.value

  if (loading.value)
    return

  if (!message || message.trim() === '')
    return

  if (openFreeNum.value && !tokenVerification.value) {
    if (freeNum.value <= 0) {
      show.value = true;
      console.log("您的密钥为空", openFreeNum.value, !tokenVerification.value, freeNum.value);
      return;
    }
  } else {
    const today = new Date();
    if (systemToken.value === "" || !tokenVerification.value) {
      show.value = true;
      console.log("//密钥为空//密钥无效");
      return;
    } else if (userIdentify.value === 0 && surplusNum.value <= 0) {
      show.value = true;
      console.log("积分已经用完了");
      return;
    } else if (userIdentify.value === 1 && (today.getTime() > expressDateNumber.value.value || expressDateNumber.value.value === 0)) {
      show.value = true;
      console.log("您的密钥已经过期，请重新申请");
      return;
    } else if (settingStore.model === 'gpt-4' && userIdentify.value === 1 && authInfo.value.vipToGpt4Num <= 0) {
      show.value = true;
      console.log("您的会员版chatgpt - 4次数已经用完了");
      return;
    } else if (settingStore.model === 'gpt-4' && userIdentify.value === 0 && surplusNum.value < 10) {
      show.value = true;
      console.log("您的积分不足chatgpt4次数已经用完了");
      return;
    }
  }
  correctAccess();

  controller = new AbortController()

  addChat(
    +uuid,
    {
      dateTime: new Date().toLocaleString(),
      text: message,
      inversion: true,
      error: false,
      isImg: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: null },
    },
  )
  scrollToBottom()

  loading.value = true
  prompt.value = ''

  let options: Chat.ConversationRequest = {}
  const lastContext = conversationList.value[conversationList.value.length - 1]?.conversationOptions

  if (lastContext && usingContext.value)
    options = { ...lastContext }

  addChat(
    +uuid,
    {
      dateTime: new Date().toLocaleString(),
      text: '',
      loading: true,
      inversion: false,
      error: false,
      isImg: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    },
  )
  scrollToBottom()

  try {
    if (settingStore.model == 'Daller2') {
      generateImages(message);
      return;
    }
    let lastText = ''
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        prompt: message,
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)
          try {
            const data = JSON.parse(chunk)
            updateChat(
              +uuid,
              dataSources.value.length - 1,
              {
                dateTime: new Date().toLocaleString(),
                text: lastText + (data.text ?? ''),
                inversion: false,
                error: false,
                loading: true,
                conversationOptions: { conversationId: data.conversationId, parentMessageId: data.id },
                requestOptions: { prompt: message, options: { ...options } },
              },
            )

            if (openLongReply && data.detail.choices[0].finish_reason === 'length') {
              console.log(openLongReply,data.detail.choices[0].finish_reason,data.detail.choices[0].finish_reason === 'length');
              options.parentMessageId = data.id
              lastText = data.text
              message = ''
              return fetchChatAPIOnce()
            }

            scrollToBottomIfAtBottom()
          }
          catch (error) {
            //
          }
        },
      })
      updateChatSome(+uuid, dataSources.value.length - 1, { loading: false })
    }

    await fetchChatAPIOnce()
  }
  catch (error: any) {
    const errorMessage = error?.message ?? t('common.wrong')

    if (error.message === 'canceled') {
      updateChatSome(
        +uuid,
        dataSources.value.length - 1,
        {
          loading: false,
        },
      )
      scrollToBottomIfAtBottom()
      return
    }
    errorAccess();
    const currentChat = getChatByUuidAndIndex(+uuid, dataSources.value.length - 1)

    if (currentChat?.text && currentChat.text !== '') {
      updateChatSome(
        +uuid,
        dataSources.value.length - 1,
        {
          text: `${currentChat.text}\n[${errorMessage}]`,
          error: false,
          loading: false,
        },
      )
      return
    }

    updateChat(
      +uuid,
      dataSources.value.length - 1,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, options: { ...options } },
      },
    )
    scrollToBottomIfAtBottom()
  }
  finally {
    loading.value = false
  }
}

async function onRegenerate(index: number) {
  if (loading.value)
    return

  if (openFreeNum.value && !tokenVerification.value) {
    if (freeNum.value <= 0) {
      show.value = true;
      console.log("您的密钥为空", openFreeNum.value, !tokenVerification.value, freeNum.value);
      return;
    }
  } else {
    const today = new Date();
    if (systemToken.value === "" || !tokenVerification.value) {
      show.value = true;
      console.log("//密钥为空//密钥无效");
      return;
    } else if (userIdentify.value === 0 && surplusNum.value <= 0) {
      show.value = true;
      console.log("积分已经用完了");
      return;
    } else if (userIdentify.value === 1 && (today.getTime() > expressDateNumber.value.value || expressDateNumber.value.value === 0)) {
      show.value = true;
      console.log("您的密钥已经过期，请重新申请");
      return;
    } else if (settingStore.model === 'gpt-4' && userIdentify.value === 1 && authInfo.value.vipToGpt4Num <= 0) {
      show.value = true;
      console.log("您的会员版chatgpt - 4次数已经用完了");
      return;
    } else if (settingStore.model === 'gpt-4' && userIdentify.value === 0 && surplusNum.value < 10) {
      show.value = true;
      console.log("您的积分不足chatgpt4次数已经用完了");
      return;
    }
  }
  correctAccess();

  controller = new AbortController()

  const { requestOptions } = dataSources.value[index]

  let message = requestOptions?.prompt ?? ''

  let options: Chat.ConversationRequest = {}

  if (requestOptions.options)
    options = { ...requestOptions.options }

  loading.value = true

  updateChat(
    +uuid,
    index,
    {
      dateTime: new Date().toLocaleString(),
      text: '',
      inversion: false,
      error: false,
      loading: true,
      isImg: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    },
  )

  try {
    if (settingStore.model == 'Daller2') {
      generateImages(message);
      return;
    }
    let lastText = ''
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        prompt: message,
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)
          try {
            const data = JSON.parse(chunk)
            updateChat(
              +uuid,
              index,
              {
                dateTime: new Date().toLocaleString(),
                text: lastText + (data.text ?? ''),
                inversion: false,
                error: false,
                loading: true,
                conversationOptions: { conversationId: data.conversationId, parentMessageId: data.id },
                requestOptions: { prompt: message, options: { ...options } },
              },
            )

            if (openLongReply && data.detail.choices[0].finish_reason === 'length') {
              options.parentMessageId = data.id
              lastText = data.text
              message = ''
              return fetchChatAPIOnce()
            }
          }
          catch (error) {
            //
          }
        },
      })
      updateChatSome(+uuid, index, { loading: false })
    }
    await fetchChatAPIOnce()
  }
  catch (error: any) {
    if (error.message === 'canceled') {
      updateChatSome(
        +uuid,
        index,
        {
          loading: false,
        },
      )
      return
    }
    errorAccess();
    const errorMessage = error?.message ?? t('common.wrong')

    updateChat(
      +uuid,
      index,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, options: { ...options } },
      },
    )
  }
  finally {
    loading.value = false
  }
}

function handleExport() {
  if (loading.value)
    return

  const d = dialog.warning({
    title: t('chat.exportImage'),
    content: t('chat.exportImageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: async () => {
      try {
        d.loading = true
        const ele = document.getElementById('image-wrapper')
        const canvas = await html2canvas(ele as HTMLDivElement, {
          useCORS: true,
        })
        const imgUrl = canvas.toDataURL('image/png')
        const tempLink = document.createElement('a')
        tempLink.style.display = 'none'
        tempLink.href = imgUrl
        tempLink.setAttribute('download', 'chat-shot.png')
        if (typeof tempLink.download === 'undefined')
          tempLink.setAttribute('target', '_blank')

        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
        window.URL.revokeObjectURL(imgUrl)
        d.loading = false
        ms.success(t('chat.exportSuccess'))
        Promise.resolve()
      }
      catch (error: any) {
        ms.error(t('chat.exportFailed'))
      }
      finally {
        d.loading = false
      }
    },
  })
}

function handleDelete(index: number) {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.deleteMessageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.deleteChatByUuid(+uuid, index)
    },
  })
}

function handleClear() {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.clearChat'),
    content: t('chat.clearChatConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.clearChatByUuid(+uuid)
    },
  })
}

function handleEnter(event: KeyboardEvent) {
  if (!isMobile.value) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
  else {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
}

function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
  }
}

// 可优化部分
// 搜索选项计算，这里使用value作为索引项，所以当出现重复value时渲染异常(多项同时出现选中效果)
// 理想状态下其实应该是key作为索引项,但官方的renderOption会出现问题，所以就需要value反renderLabel实现
const searchOptions = computed(() => {
  if (prompt.value.startsWith('/')) {
    return promptTemplate.value.filter((item: { key: string }) => item.key.toLowerCase().includes(prompt.value.substring(1).toLowerCase())).map((obj: { value: any }) => {
      return {
        label: obj.value,
        value: obj.value,
      }
    })
  }
  else {
    return []
  }
})

// value反渲染key
const renderOption = (option: { label: string }) => {
  for (const i of promptTemplate.value) {
    if (i.value === option.label)
      return [i.key]
  }
  return []
}

const placeholder = computed(() => {
  if (isMobile.value)
    return t('chat.placeholderMobile')
  return t('chat.placeholder')
})

const buttonDisabled = computed(() => {
  return loading.value || !prompt.value || prompt.value.trim() === ''
})
const selectedDisabled = computed(() => {
  return loading.value;
});
const footerClass = computed(() => {
  let classes = ['p-4']
  if (isMobile.value)
    classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-3', 'overflow-hidden']
  return classes
})

onMounted(() => {
  scrollToBottom()
  if (inputRef.value && !isMobile.value)
    inputRef.value?.focus()
})

onUnmounted(() => {
  if (loading.value)
    controller.abort()
})
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <HeaderComponent
      v-if="isMobile"
      :using-context="usingContext"
      @export="handleExport"
      @toggle-using-context="toggleUsingContext"
    />
    
    <main class="flex-1 overflow-hidden">
      
      <div class="flex items-center space-x-4 justify-center">
        <div class="flex flex-wrap items-center gap-4">
          <NSelect
            style="width: 140px"
            :value="model"
            :options="modelOptions"
            :disabled="selectedDisabled"
            @update-value="value => settingStore.setModel(value)"
          />
        </div>
      </div>
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto" >
        <div id="image-wrapper" class="w-full max-w-screen-xl m-auto dark:bg-[#101014]" :class="[isMobile ? 'p-2' : 'p-4']" >
          <template v-if="!dataSources.length">
            <!--<div class="flex items-center justify-center mt-4 text-center text-neutral-300">
                  <SvgIcon icon="ri:bubble-chart-fill" class="mr-2 text-3xl" />
                  <span>欢迎使用ChatGPT聊天系统~</span>
                </div> -->
            <HelpDoc :visible="true"/>
          </template>
          <template v-else>
            <div>
              <Message
                v-for="(item, index) of dataSources"
                :key="index"
                :date-time="item.dateTime"
                :text="item.text"
                :inversion="item.inversion"
                :error="item.error"
                :loading="item.loading"
                :is-img="item.isImg"
                @regenerate="onRegenerate(index)"
                @delete="handleDelete(index)"
              />
              <div class="sticky bottom-0 left-0 flex justify-center">
                <NButton v-if="loading" type="warning" @click="handleStop">
                  <template #icon>
                    <SvgIcon icon="ri:stop-circle-line" />
                  </template>
                  Stop Responding
                </NButton>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>
    <footer :class="footerClass">
      <div class="w-full max-w-screen-xl m-auto">
        <div v-if="userIdentify==1" role="none" class="n-space" style="color:#ccc;display: flex; flex-flow: row wrap; justify-content: center; align-items: center; gap: 8px 12px;">
          <div role="none" style="max-width: 100%;">
            <span class="n-text" style="--n-bezier: cubic-bezier(.4, 0, .2, 1); --n-text-color: rgb(118, 124, 130); --n-font-weight-strong: 500; --n-font-famliy-mono: v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace; --n-code-border-radius: 2px; --n-code-text-color: rgb(51, 54, 57); --n-code-color: rgb(244, 244, 248); --n-code-border: 1px solid #0000;">GPT-4资源有限，您当前还剩{{authInfo.vipToGpt4Num}}次使用次数，不够用可以购买积分版，则使用无限制的GPT-4</span>
          </div>
        </div>
        <div v-if="userIdentify==0" role="none" class="n-space" style="color:#ccc;display: flex; flex-flow: row wrap; justify-content: center; align-items: center; gap: 8px 12px;">
          <div role="none" style="max-width: 100%;">
            <span class="n-text" style="--n-bezier: cubic-bezier(.4, 0, .2, 1); --n-text-color: rgb(118, 124, 130); --n-font-weight-strong: 500; --n-font-famliy-mono: v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace; --n-code-border-radius: 2px; --n-code-text-color: rgb(51, 54, 57); --n-code-color: rgb(244, 244, 248); --n-code-border: 1px solid #0000;">GPT-4无限制畅享，由于成本较高，一次提问消耗10个积分</span>
          </div>
        </div>
        <div class="flex items-center justify-between space-x-2">
          <HoverButton @click="handleClear">
            <span class="text-xl text-[#4f555e] dark:text-white">
              <SvgIcon icon="ri:delete-bin-line" />
            </span>
          </HoverButton>
          <HoverButton v-if="!isMobile" @click="handleExport">
            <span class="text-xl text-[#4f555e] dark:text-white">
              <SvgIcon icon="ri:download-2-line" />
            </span>
          </HoverButton>
          <HoverButton v-if="!isMobile" @click="toggleUsingContext">
            <span class="text-xl" :class="{ 'text-[#4b9e5f]': usingContext, 'text-[#a8071a]': !usingContext }">
              <SvgIcon icon="ri:chat-history-line" />
            </span>
          </HoverButton>
          <NAutoComplete v-model:value="prompt" :options="searchOptions" :render-label="renderOption">
            <template #default="{ handleInput, handleBlur, handleFocus }">
              <NInput
                ref="inputRef"
                v-model:value="prompt"
                type="textarea"
                :placeholder="placeholder"
                :autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }"
                @input="handleInput"
                @focus="handleFocus"
                @blur="handleBlur"
                @keypress="handleEnter"
              />
            </template>
          </NAutoComplete>
          <NButton type="primary" :disabled="buttonDisabled" @click="handleSubmit">
            <template #icon>
              <span class="dark:text-black">
                <SvgIcon icon="ri:send-plane-fill" />
              </span>
            </template>
          </NButton>
        </div>
      </div>
      <Setting v-if="show" v-model:visible="show" />
    </footer>
  </div>
</template>
