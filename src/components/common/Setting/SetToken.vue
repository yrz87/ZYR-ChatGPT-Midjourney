<script lang="ts" setup>
import { computed, ref } from "vue";
import { NButton, NInput, useMessage } from "naive-ui";
import { useTokenStore } from "@/store";
import type { AuthInfo } from "@/store/modules/token/helper";
import { t } from "@/locales";
import { verificationCode } from "@/api/db";

const tokenStore = useTokenStore();

const ms = useMessage();
const authInfo = computed(() => tokenStore.authInfo);

// const description = computed(() => authInfo.value.systemToken)
const systemToken = ref(authInfo.value.systemToken ?? "");
const openFreeNum = computed(() => authInfo.value.openFreeNum);
const tokenVerification = computed(() => authInfo.value.tokenVerification);
const freeNum = computed(() => authInfo.value.freeNum);
// console.log("surplusNum:",authInfo.value.surplusNum,"useNum:",authInfo.value.useNum,"tokenVerification:",authInfo.value.tokenVerification);
let textMessage = "您的密钥为无效密钥,请获取并输入密钥！";

let loading = ref(false);
const myComputedBoolean = computed(() => loading.value); // 创建计算属性以便动态响应 loading 的变化
console.log(myComputedBoolean);
function updateSettings(options: Partial<AuthInfo>) {
  if (!loading.value) {
    loading.value = true;
    //调用数据库测试该密钥是否正确
    verificationToken(options);
    // console.log("options:",options)
    // tokenStore.updateSetting(options)
  } else {
    ms.warning(t("common.loading"));
  }
}

// 将 ISO 8601 字符串转换为年月日格式的函数
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

interface ResponseData {
  data: {
    use_num: number;
    surplus: number;
    userIdentify: number;
    startDate: string;
    expressDate: string;
    expressDateNumber: number;
    vipChatgpt4Num: number;
    // 如果需要，您还可以添加其他属性
  };
  success: boolean;
  message: string;
}

// 验证token是否有效/正确,以及剩余次数
async function verificationToken<T = any>(options: Partial<AuthInfo>) {
  // console.log("验证token是否有效/正确,以及剩余次数")

  try {
    const response = (await verificationCode({
      token: systemToken.value,
    })) as ResponseData;
    console.log("response:", response);
    if (response && response.success) {
      // console.log("successfully",response.data.surplus,response.data.use_num);
      textMessage = "";
      // "剩余次数:"+response.data.surplus+",已提问次数:"+response.data.use_num
      console.log("===response.data", response.data);
      // Redirect or perform other actions upon successful login
      if (response.data.userIdentify == 1) {
        //包月
        const expressDate =
          response.data.expressDate == "0"
            ? "永久"
            : formatDate(response.data.expressDate);
        const expressDateNumber =
          response.data.expressDate == "0"
            ? 0
            : new Date(response.data.expressDate).getTime();
        const vipChatgpt4Num =
          response.data.vipChatgpt4Num == null
            ? 0
            : response.data.vipChatgpt4Num;
        tokenStore.updateSetting({
          startDate: formatDate(response.data.startDate),
          expressDate: expressDate,
          expressDateNumber: expressDateNumber,
          tokenVerification: true,
          systemToken: options.systemToken,
          userIdentify: response.data.userIdentify,
          vipToGpt4Num: vipChatgpt4Num,
        }); //将剩余次数,已经使用次数放入缓存
      } else if (response.data.userIdentify == 0) {
        //购买次数
        tokenStore.updateSetting({
          surplusNum: response.data.surplus,
          useNum: response.data.use_num,
          tokenVerification: true,
          systemToken: options.systemToken,
          userIdentify: response.data.userIdentify,
        }); //将剩余次数,已经使用次数放入缓存
      }
      ms.success(t("common.success"));
    } else {
      tokenStore.updateSetting({
        tokenVerification: false,
        surplusNum: 0,
        useNum: 0,
        systemToken: "",
        startDate: "",
        expressDate: "",
        vipToGpt4Num: 0,
      }); //Token验证无效
      console.error("Token验证无效:", response);
      textMessage = response.message;
      // ms.error("您的密钥为无效密钥")
    }
  } catch (error) {
    console.log("error:", error);
  } finally {
    loading.value = false;
  }
}
// function handleReset() {
//   tokenStore.resetSetting()
//   ms.success(t('common.success'))
//   window.location.reload()
// }

// function handleQuery() {
//   // tokenStore.resetSetting()
//   // ms.success(t('common.success'))
//   // window.location.reload()
// }
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <!-- {{freeNum>0 && openFreeNum}}-{{freeNum>0}}-{{openFreeNum}}-{{tokenVerification}}-{{!tokenVerification}} -->
    <div
      class="text-lg font-bold"
      v-if="freeNum > 0 && openFreeNum && !tokenVerification"
    >
      您的免费试用次数为:<text style="color: red">{{ freeNum }}</text>
    </div>
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[50px]">{{ $t("setting.token") }}：</span>
        <div class="flex-1">
          <NInput
            v-model:value="systemToken"
            placeholder="密钥不能为空,请输入正确的密钥"
          />
        </div>
        <NButton
          size="tiny"
          text
          type="primary"
          @click="updateSettings({ systemToken })"
          :style="{ color: loading ? '#ccc' : '' }"
        >
          {{ $t("common.save") }}
        </NButton>
      </div>
      <p style="color: red" v-if="!authInfo.tokenVerification">
        {{ textMessage }}
      </p>
      <!-- <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">&nbsp;</span>
        <NButton size="small" @click="handleReset">
          {{ $t('common.reset') }}
        </NButton>
        <NButton size="small" @click="handleQuery">
          {{ $t('common.query') }}
        </NButton>
      </div> -->
    </div>

    <div class="p-2 space-y-2 rounded-md bg-neutral-100 dark:bg-neutral-700">
      <div class="text-lg font-bold" v-if="authInfo.userIdentify == 0">
        您剩余积分为:<text style="color: red">{{ authInfo.surplusNum }}</text
        >,已经使用积分为:<text style="color: red">{{ authInfo.useNum }}</text>
      </div>
      <div class="text-lg font-bold" v-if="authInfo.userIdentify == 1">
        您的有效期为:<text style="color: red">{{ authInfo.expressDate }}</text
        >,注册时间为:<text style="color: red">{{ authInfo.startDate }}</text>
      </div>
      <div class="text-xl font-bold">
        获取密钥链接:
        <a
          class="text-blue-600 dark:text-blue-500"
          :href="authInfo.getTokenUrl"
          target="_blank"
        >
          {{ authInfo.getTokenUrl }}
        </a>
      </div>
      <p style="color: red">如有疑问或者需要帮助,请联系客服QQ：657008145</p>
    </div>
  </div>
</template>
