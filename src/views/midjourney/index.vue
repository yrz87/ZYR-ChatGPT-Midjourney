<script setup lang='ts'>
import { computed, onUnmounted, ref } from "vue";
import {
  NPopover,
  useMessage,
  useDialog,
  // NDialog,
  NPagination,
  NTooltip,
  // NImageGroup,
  NImage,
  NInput,
  NButton,
  NEmpty,
  NUpload,
  NCard,
  NUploadDragger,
} from "naive-ui";
import {
  mjSubmitImagine,
  mjTaskIdFetch,
  mjSubmitChange,
  mjSubmitDescribe,
  mjSubmitBlend,
  // mjTaskQueue,
  // useGetMidjourneySelfProxyUrl,
} from "@/api/midjourney";
import { useMidjourneyStore } from "@/store";
import { useRoute } from "vue-router";
import { useMidjourney } from "./hooks/useMidjourney";
import { useBasicLayout } from "@/hooks/useBasicLayout";
import { SvgIcon } from "@/components/common";
import { t } from '@/locales'
const {
  addMidjourney,
  // updateMidjourney,
  updateMidjourneySome,
  getMidjourneyByUuidAndIndex,
} = useMidjourney();

let controller = new AbortController();
// import type { ImgageType } from "@/store/modules/midjourney/helper";
const dialog = useDialog();
const message = useMessage();
// 定义图片类型
// export type ImageType = "IMAGINE" | "BLEND" | "DESCRIBE";


// let imageType = ref<ImgageType>('');
// const imageType = ref(""); // 这里你应该对 imageType 进行正确的初始化
// // const computedImgageType = computed(() => midjourneyStore.imageType);
let fileLists = ref<FileObject[]>([]);


type ImageType = 'IMAGINE' | 'DESCRIBE' | 'BLEND' | '';

interface ImageTypeObject {
  value: ImageType;
}
let imageType: ImageTypeObject = {
  value: ''
};

// let imageType: ImageTypeObject;  // 假设你已经初始化了imgageType
// let fileLists: { value: { base64: string }[] };  // 假设你已经初始化了fileList

// 创建响应式引用

const setImgageType = (type: ImageType) => {
  imageType.value = type;
};
const imgageTypeOptions: { label: string; key: ImageType; image: string }[] = [
  {
    key: "IMAGINE",
    label: "垫图",
    image: "MidImg",
  },
  {
    key: "BLEND",
    label: "混图",
    image: "NIJIImg",
  },
  {
    key: "DESCRIBE",
    label: "识图",
    image: "NIJIImg",
  },
];
const midjourneyStore = useMidjourneyStore();

// function handleImgageType(val: string) {
//   midjourneyStore.updateMidjourney({
//     imageType: val,
//   });
// }

const route = useRoute();
const { uuid } = route.params as { uuid: string };
// 创建响应式引用
let page = ref(1);
let pageSize = ref(8);

let dataSources = computed(() =>
  midjourneyStore.getMidjourneyByPage(+uuid, page.value, pageSize.value)
);
const dataSourcesLength = computed(() =>
  midjourneyStore.getMidjourneyByUuidLength(+uuid)
);
let progressNum = computed(() => midjourneyStore.progressNum);
function onPageChange(newPage: number) {
  page.value = newPage;
}
const loading = ref<boolean>(false);
const prompt = ref<string>("");
const ignorePrompt = ref<string>("");
const buttonDisabled = computed(() => {
  console.log(imageType,"===imageType");
  if (imageType.value === "BLEND" || imageType.value == "DESCRIBE")
    return false;
  return loading.value || !prompt.value || prompt.value.trim() === "";
});
const { isMobile } = useBasicLayout();

// let url = "https://cdn.discordapp.com/attachments/1119918876113764393/1121368988589490177/morganlisa_8971489817988028_fc827f63-bdd6-4de6-ae41-da18bd8b84ea.png";
// const imageSrc = await download();
// console.log("imageSrc:",imageSrc);

function handleButtonClick(action: string, taskId: string, index: number) {
  let title = action == "UPSCALE" ? "放大" : "转换";
  dialog.warning({
    title: title,
    content: "你确定" + title + "第" + index + "张图片？",
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: () => {
      // message.success('确定')
      upscale(action, taskId, index);
    },
    onNegativeClick: () => {
      // message.error('不确定')
    },
  });
}
function deleteByIndex(index: number) {
  dialog.warning({
    title: "删除任务",
    content: "确定删除此任务？",
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: () => {
      // message.success('确定')
      //如果有正在进行的任务呢
      controller.abort();
      loading.value = false;
      midjourneyStore.deleteMidjourneyByUuid(+uuid, index);
    },
    onNegativeClick: () => {
      // message.error('不确定')
    },
  });
}
function addMidjourneyData(action: string, taskId: string, prompt: string) {
  addMidjourney(+uuid, {
    dateTime: new Date().toLocaleString(),
    failReason: "",
    progress: "",
    action,
    model: midjourneyStore.drawModel,
    finished: false,
    requestOptions: { prompt, promptEn: "", description: "" },
    taskId,
    status: "NOT_START",
    imgUrl: "",
  });
}

// async function mjTaskQueue(){
//   const res = await mjTaskQueue();
//   console.log(res,"====res");
// }

async function upscale(action: string, taskId: string, index: number) {
  retryCount = 0;
  addMidjourneyData(action, taskId, "");
  try {
    const res = await mjSubmitChange({ taskId, action, index });
    detailMidjourney(res, 0);
  } catch (error: any) {
    console.error(error);
    retryCount++;
    if (retryCount === maxRetries) {
      loading.value = false;
      console.error("请求失败，已达最大重试次数");
    }
  }
}

// function GetImgageType() {
//   if (imageType.value) {
//     //有值
//   }
//   if (fileLists.value.length > 0) {
//     const imageTypes = {
//       IMAGINE: () => fileLists.value[0].base64,
//       DESCRIBE: () => fileLists.value[0].base64,
//       BLEND: () => {
//         if (fileLists.value.length < 2) {
//           message.error("混图模式下至少需要 2 张图片");
//           return ""; // 返回空字符串，而不是undefined
//         }
//         return fileLists.value.slice(0, 2).map((file) => file.base64);
//       },
//     };

//     return imageTypes[imageType.value] ? imageTypes[imageType.value]() : "";
//   } else {
//     message.error("没有上传的图片");
//     return ""; // 返回空字符串，而不是undefined
//   }
// }


function GetImgageType() {
  if (imageType.value) {
    //有值
  }
  if (fileLists.value.length > 0) {
    const imageTypes: { [K in ImageType]: () => string | string[] } = {
      IMAGINE: () => fileLists.value[0].base64,
      DESCRIBE: () => fileLists.value[0].base64,
      BLEND: () => {
        if (fileLists.value.length < 2) {
          message.error("混图模式下至少需要 2 张图片");
          return ""; // 返回空字符串，而不是undefined
        }
        return fileLists.value.slice(0, 2).map((file) => file.base64);
      },
      "": () => "",  // 当imgageType.value为空字符串时，返回空字符串
    };

    return imageTypes[imageType.value as ImageType] ? imageTypes[imageType.value as ImageType]() : "";
  } else {
    message.error("没有上传的图片");
    return ""; // 返回空字符串，而不是undefined
  }
}


async function handleSubmit() {
  retryCount = 0;
  if (loading.value) return;

  let imageBase64 = imageType.value ? GetImgageType() : "";

  let message = prompt.value;

  const isImagineType = imageType.value === "IMAGINE";
  const hasImage = imageBase64 !== "";
  const hasMessage = message && message.trim() !== "";

  // 如果 imageType 是 'IMAGINE' 或者空字符串，并且没有图像，返回
  if (isImagineType && !hasImage) return;

  // 如果没有消息并且 imageType 是 'IMAGINE' 或者空字符串，返回
  if (!hasMessage && isImagineType) return;

  // Ignore certain elements
  if (ignorePrompt.value) {
    message += " --no " + ignorePrompt.value;
  }
  controller = new AbortController();
  // Assemble the parameters
  // console.log("midjourneyStore.carryParam:", midjourneyStore.carryParam);
  // if (midjourneyStore.carryParam) {
  //   const optionalParams = ["aspect", "stylize", "chaos"].filter(
  //     (param) => midjourneyStore[param]
  //   );
  //   message += optionalParams
  //     .map((param) => ` --${param} ${midjourneyStore[param]}`)
  //     .join("");
  // }
  console.log("midjourneyStore.carryParam:", (midjourneyStore as any).carryParam);
  if ((midjourneyStore as any).carryParam) {
    const optionalParams = ["aspect", "stylize", "chaos"].filter(
      (param) => (midjourneyStore as any)[param]
    );
    message += optionalParams
      .map((param) => ` --${param} ${(midjourneyStore as any)[param]}`)
      .join("");
  }

  addMidjourneyData(imageType.value, "", message);
  midjourneyStore.updateMidjourney({
    progressNum:progressNum.value+1
  })
  const index = 0;

  loading.value = true;
  prompt.value = "";
  ignorePrompt.value = "";
  fileLists.value.length = 0;
  try {
    // const submitMethods = {
    //   IMAGINE: mjSubmitImagine,
    //   BLEND: mjSubmitBlend,
    //   DESCRIBE: mjSubmitDescribe,
    //   "": mjSubmitImagine,
    // };
    // // 对于每种方法，定义一个与其对应的参数对象
    // const submitParameters = {
    //   IMAGINE: {
    //     prompt: message,
    //     base64: imageBase64,
    //     signal: controller.signal,
    //   },
    //   BLEND: { base64Array: imageBase64 },
    //   DESCRIBE: { base64: imageBase64 },
    //   "": { prompt: message, base64: imageBase64, signal: controller.signal },
    // };
    // const method = submitMethods[imageType.value];
    // const parameters = submitParameters[imageType.value];
    // const res = await method(parameters);
    // console.log(res);
    // detailMidjourney(res, index);

    const submitMethods: { [key: string]: any } = {
      IMAGINE: mjSubmitImagine,
      BLEND: mjSubmitBlend,
      DESCRIBE: mjSubmitDescribe,
      "": mjSubmitImagine,
    };

    const submitParameters: { [key: string]: any } = {
      IMAGINE: {
        prompt: message,
        base64: imageBase64,
        signal: controller.signal,
      },
      BLEND: { base64Array: imageBase64 },
      DESCRIBE: { base64: imageBase64 },
      "": { prompt: message, base64: imageBase64, signal: controller.signal },
    };

    const method = submitMethods[imageType.value];
    const parameters = submitParameters[imageType.value];
    const res = await method(parameters);
    console.log(res);
    detailMidjourney(res, index);
  } catch (error: any) {
    console.error(error);
    retryCount++;
    if (retryCount === maxRetries) {
      loading.value = false;
      updateMidjourneySome(+uuid, index, {
        failReason: "任务超时" || "未知错误",
        status: "TIMEOUT",
      });
      console.error("请求失败，已达最大重试次数");
    }
  }
}

// type Status = "SUCCESS" | "FAILURE" | "FAILED" | "NOT_START" | "IN_PROGRESS" | "SUBMITTED" | "TIMEOUT" | "RES_ERROR" | "UNKNOWN_ERROR";

// const statusMap: { [K in Status]: string } = {
//   SUCCESS: "成功",
//   FAILURE: "错误",
//   FAILED: "错误",
//   NOT_START: "排队中",
//   IN_PROGRESS: "执行中",
//   SUBMITTED: "排队中",
//   TIMEOUT: "超时",
//   RES_ERROR: "任务出错",
//   UNKNOWN_ERROR: "未知错误",
// };

// function returnStatus(val: Status) {
//   return statusMap[val] ?? "";
// }


async function detailMidjourney(resJson: any, index: number) {
  // const { data: resJson, success } = res;
  // console.log(resJson,resJson && resJson.code != 1);

  if (resJson && resJson.code != 1) {
    updateMidjourneySome(+uuid, index, {
      failReason: `${resJson.description}`,
      finished: true,
      status: "RES_ERROR",
    });
  } else {
    updateMidjourneySome(+uuid, index, { taskId: resJson.result });
    retryInterval = 10000; // 5秒重试间隔
    fetchStatusByTaskId(resJson.result, index);
  }
}
let retryCount = 0; //当前重试次数
const maxRetries = 3; //最大重试次数
let retryInterval = 10000; // 5秒重试间隔

async function fetchStatusByTaskId(taskId: string, index: number) {
  const midjourneyMessage = getMidjourneyByUuidAndIndex(+uuid, index) as any;
  const model = midjourneyMessage.model;
  let timerId: NodeJS.Timeout;
  timerId = setTimeout(async () => {
    try {
      const statusResJson = await mjTaskIdFetch({ taskId, model });
      console.log(statusResJson, "====statusResJson");
      if (statusResJson) {
        handleStatus(index, statusResJson, midjourneyMessage, taskId);
      }
    } catch (error: any) {
      console.log("catch:", error);
      retryCount++;
      if (retryCount === maxRetries) {
        loading.value = false;
        clearInterval(timerId);
        updateMidjourneySome(+uuid, index, {
          failReason: "任务超时",
          status: "TIMEOUT",
        });
        console.error("请求失败，已达最大重试次数");
      }
    }
  }, retryInterval);
}

function handleStatus(
  index: number,
  statusResJson: any,
  midjourneyMessage: any,
  taskId: string
) {
  // let isFinished = false;
  // if(!(statusResJson && typeof statusResJson === 'object')){
  //   isFinished = true;
  // }else{
  //   isFinished = ["SUCCESS", "FAILURE", "FAILED"].includes(statusResJson.status);
  // }
  const isFinished = ["SUCCESS", "FAILURE", "FAILED"].includes(
    statusResJson.status
  );
  midjourneyMessage.failReason = statusResJson.failReason;
  midjourneyMessage.progress = statusResJson.progress;
  midjourneyMessage.status = statusResJson.status;
  midjourneyMessage.action = statusResJson.action;
  midjourneyMessage.requestOptions.prompt = statusResJson.prompt;
  midjourneyMessage.requestOptions.promptEn = statusResJson.promptEn;
  midjourneyMessage.requestOptions.description = statusResJson.description;
  let imgUrl = statusResJson.imageUrl;
  // if(imgUrl){
  //   imgUrl = useGetMidjourneySelfProxyUrl(imgUrl);
  // }
  console.log("imgUrl:", imgUrl);
  midjourneyMessage.imgUrl = imgUrl;

  if (isFinished) {
    // midjourneyStore.progressNum
    midjourneyStore.updateMidjourney({
      progressNum:progressNum.value-1
    })
    midjourneyMessage.finished = true;
    loading.value = false;
  } else {
    // console.log(statusResJson);
    if (statusResJson.status === "IN_PROGRESS" && statusResJson.imageUrl) {
    }
    // statusResJson.id  == taskId
    fetchStatusByTaskId(taskId, index);
  }
  updateMidjourneySome(+uuid, index, midjourneyMessage);
}

const placeholder = computed(() => {
  if (isMobile.value) return t("midjourney.placeholderMobile");
  return t("midjourney.placeholder");
});
const ignorePlaceholder = computed(() => {
  if (isMobile.value) return t("midjourney.ignorePlaceholderMobile");
  return t("midjourney.ignorePlaceholder");
});

function useToPrompt(val: string) {
  prompt.value = val;
}
function RefreshData() {
  console.log("RefreshData");
  // 未知原因刷新页面，loading 状态不会重置，手动重置
  dataSources.value.forEach((item, index) => {
    if (!item.finished && item.taskId) {
      console.log(
        "====RefreshData===",
        item.taskId,
        item.finished,
        item.taskId
      );
      retryInterval = 5000; // 5秒重试间隔
      fetchStatusByTaskId(item.taskId, index);
    }
  });
}
function backgroundGetData(){
  console.log("backgroundGetData");
  handleStop();
}
// 未知原因刷新页面，loading 状态不会重置，手动重置
dataSources.value.forEach((item, index) => {
  if (item.finished){
    let url = item.imgUrl;
    url = url.replace("https://cdn.discordapp.com/attachments", "/images/cnd-discordapp")
    console.log(url,"==url");

    updateMidjourneySome(+uuid, index, {imgUrl:url});
  }
})

interface FileObject {
  file: File;
  base64: string;
  // 在这里添加其它的属性...
}
// const handlePreview = ({
//   fileLists: newFileList,
// }: {
//   fileLists: FileObject[];
// }) => {
//   fileLists.value = newFileList;
//   for (const file of fileLists.value) {
//     const reader = new FileReader();
//     reader.readAsDataURL(file.file);
//     reader.onload = () => {
//       file.base64 = reader.result as string;
//     };
//   }
//   if (fileLists.value.length == 0) {
//     imageType.value = "";
//   } else if (!imageType.value && fileLists.value.length == 1) {
//     imageType.value = "IMAGINE";
//   }
// };

function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
  }
}

onUnmounted(() => {
  if (loading.value) controller.abort();
});

let attribute = [
  {tag:"UPSCALE",name:"放大",note:"参数释义：放大某张图片 如 U1 放大第一张图片，以此类推",list:["U1","U2","U3","U4"]},
  {tag:"VARIATION",name:"变换",note:"参数释义：以某张图片为基准重新生成 如 V1则变换第一张图片，以此类推",list:["V1","V2","V3","V4"]},

]
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <main>
      <div class="p-4 space-y-4">
        <h2 class="text-xl font-bold">AI绘画</h2>
        <!-- <img src="http://localhost:3002/attachments/1119918876113764393/1121350142595965048/morganlisa_4019753687806840_a_yellow_pig_c748bd97-4528-44b5-9313-6a6eef1ca10e.png" /> -->
        <!-- <img
          src="http://localhost:3002/attachments/1118849591668899921/1121766035796787270/brownlisa_9760788004717540_447955fd-55af-4f87-b3b8-cf861ad43070.png"
        /> -->
        <div class="flex items-center space-x-4">
          你想生成什么风格或类型图像？
        </div>
        <!-- :fileList="fileLists" -->
        <!-- @change="handlePreview" -->
        <NUpload
          directory-dnd
          :max="2"
          multiple
          type="primary"
          list-type="image-card"
          accept=".png,.jpg,.webp,.jpeg"
          
          
          :default-upload="false"
        >
          <NUploadDragger>
            <div class="p-4 space-y-4">
              <SvgIcon icon="icon-park:upload-one" />
              <!-- <NTooltip placement="top" trigger="hover">
          <template #trigger>
            <SvgIcon icon="ion:alert-circle-outline" />
          </template>
          <div class="large-text">MJ：通用模型</div>
          <div class="large-text">NIJI：动漫风格模型</div>
        </NTooltip> -->
              <div class="flex items-center space-x-4">参考图</div>
            </div>
          </NUploadDragger>
        </NUpload>
        <!-- <NButton @click="removeFirstImage">Remove First Image</NButton> -->
        <!-- </NImageGroup> -->
        <div class="items-center space-x-4" v-if="fileLists.length">
          <div class="flex flex-wrap items-center gap-4">
            <template v-for="item of imgageTypeOptions" :key="item.key">
              <NButton
                size="small"
                :type="item.key === imageType.value ? 'primary' : undefined"
                @click="setImgageType(item.key)"
              >
                {{ item.label }}
              </NButton>
            </template>
          </div>
          <div class="flex-wrap items-center">
            提示：垫图模式/识图(describe)模式只会使用第一张图片，混图(blend)模式会按顺序使用选中的两张图片（点击图片可以移除）
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <p>生成提示词</p>
            <!-- <NButton size="small" type="success">翻译</NButton> -->
          </div>
          <NInput
            ref="inputRef"
            v-model:value="prompt"
            type="textarea"
            :disabled="imageType.value == 'BLEND' || imageType.value == 'DESCRIBE'"
            :placeholder="placeholder"
            :autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }"
          />

        </div>
        <div>
          <div class="flex items-center justify-between">
            <p>忽略元素(可选)</p>
            <!-- <NButton size="small" type="success"> 翻译</NButton> -->
          </div>
          <NInput
            ref="inputRef"
            v-model:value="ignorePrompt"
            type="textarea"
            :disabled="imageType.value == 'BLEND' || imageType.value == 'DESCRIBE'"
            :placeholder="ignorePlaceholder"
            :autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }"
          />
        </div>
        <NButton
          size="small"
          type="primary"
          :disabled="buttonDisabled"
          @click="handleSubmit"
          >创建绘画任务</NButton
        >

        <div>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold">
              当前任务
              <NTooltip placement="top" trigger="hover">
                <template #trigger>
                  <SvgIcon icon="ion:alert-circle-outline" />
                </template>
                <div class="large-text">未启动：任务等待执行</div>
                <div class="large-text">执行中：任务正在执行中</div>
                <div class="large-text">失败：任务执行失败</div>
                <div class="large-text">成功：任务执行成功</div>
              </NTooltip>
            </h2>
          </div>
          <div>
            <NButton strong secondary type="primary" round @click="RefreshData">刷新</NButton>
          </div>
          <template v-if="dataSources.length == 0">
            <NEmpty description="暂无任务"></NEmpty>
          </template>
          <NCard :bordered="false" class="flex text-xl items-center justify-between text-center">
            <div class="flex-shrink-0">当前{{progressNum}}个进行中的任务,请耐心等待。</div>
            <div class="flex-shrink-0">点击后台执行后,仍可手动刷新列表后进行查看...</div>
            <NButton ghost type="error" @click="backgroundGetData">后台执行</NButton>
          </NCard>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold">
              任务列表
              <NTooltip placement="top" trigger="hover">
                <template #trigger>
                  <SvgIcon icon="ion:alert-circle-outline" />
                </template>
                <div class="large-text">未启动：任务等待执行</div>
                <div class="large-text">执行中：任务正在执行中</div>
                <div class="large-text">失败：任务执行失败</div>
                <div class="large-text">成功：任务执行成功</div>
              </NTooltip>
            </h2>
            <div>
              <NButton strong secondary type="primary" round @click="RefreshData">刷新</NButton>
              <NButton strong secondary type="primary" round @click="RefreshData">导出</NButton>
            </div>
          </div>
          <text>总共：{{ dataSourcesLength }}</text>

          <template v-if="dataSources.length == 0">
            <NEmpty description="暂无任务"></NEmpty>
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
                <!-- <NButton round size="small" type="primary" tag="text" ghost>{{
                  returnStatus(item.status)
                }}</NButton> -->
                <!-- <NButton round size="small" type="primary" tag="button" ghost>{{
                  returnStatus(item.status)
                }}</NButton> -->

                <NPopover
                  style="max-width: 400px"
                  placement="top"
                  trigger="hover"
                >
                  <template #trigger>
                    <div>
                      <!-- 添加一个div作为唯一的直接子元素 -->
                      <NButton
                        size="small"
                        @click="useToPrompt(item.requestOptions.promptEn)"
                        v-if="!(item.action == 'UPSCALE') && item.finished"
                      >
                        <SvgIcon icon="ion:brush-outline" />使用
                      </NButton>
                    </div>
                  </template>
                  <div class="large-text">
                    {{ item.requestOptions.promptEn }}
                  </div>
                </NPopover>

                <NButton
                  size="small"
                  v-if="item.status == 'SUCCESS' && item.imgUrl"
                  ><SvgIcon icon="ion:download-outline" />下载</NButton
                >
                <NButton size="small" @click="deleteByIndex(index)"
                  ><SvgIcon icon="ri:delete-bin-line" />删除</NButton
                >
              </div>
              <div class="my-4 h-[280px]" v-if="item.finished">
                <div
                  class="flex h-full w-full items-center justify-center overflow-hidden rounded-md"
                >
                  <div role="none" class="n-image" v-if="item.imgUrl">
                    <NImage
                      :src="item.imgUrl"
                      :data-preview-src="item.imgUrl"
                      loading="lazy"
                      data-error="false"
                      data-group-id=""
                      style="object-fit: contain"
                    />
                    <!-- <template> -->
                    <!-- 之前的方式 -->
                    <!-- <img :src="'https://cdn.discordapp.com/attachments/' + imageId" /> -->

                    <!-- 使用代理的方式 -->
                    <!-- <img :src="'http://localhost:3000/attachments/' + imageId" /> -->

                    <!-- </template> -->
                  </div>
                  <div class="flex items-center space-x-4" v-else>
                    <div class="flex items-center space-x-4">
                      <SvgIcon
                        class="flex items-center space-x-4 text-xl"
                        icon="twemoji:anxious-face-with-sweat"
                        v-if="
                          item.status == 'FAILURE' || item.status == 'FAILED'
                        "
                      />
                      <SvgIcon v-else class="text-xl" icon="fxemoji:rocket" />
                    </div>
                    <div class="flex items-center space-x-4">
                      <text v-if="item.status == 'FAILURE'">错误信息：</text>
                      {{ item.failReason }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="my-4 h-[280px]" v-else>
                <div
                  class="flex h-full w-full items-center justify-center overflow-hidden rounded-md"
                >
                  <SvgIcon class="text-xl" icon="svg-spinners:blocks-wave" />
                  <div
                    class="flex items-center space-x-4"
                    v-if="item.status == 'NOT_START'"
                  >
                    排队中...
                  </div>
                  <div
                    class="flex items-center space-x-4"
                    v-if="item.status == 'IN_PROGRESS'"
                  >
                    <div>执行中...</div>
                    <div>{{ item.progress }}</div>
                  </div>
                </div>
              </div>
              <div
                class="-mx-4 -mb-4 flex items-start bg-[#fafafc] px-4 py-2 dark:bg-[#262629]"
              >
                <div class="flex-1">
                  <div>
                    <div class="mb-2 flex items-center justify-between" v-for="(obj, index2) of attribute" :key="index2">
                      <span>{{obj.name}}：</span>
                      <NTooltip placement="right" trigger="hover">
                        <template #trigger>
                          <SvgIcon icon="ion:alert-circle-outline" />
                        </template>
                        <div class="large-text">
                          {{obj.note}}
                        </div>
                      </NTooltip>
                      <div class="flex-1">
                        <div class="flex items-center justify-around">
                          <NButton
                            v-for="(obj2, index3) of obj.list" :key="index3"
                            size="small"
                            :disabled="!item.finished || !item.imgUrl"
                            @click="handleButtonClick(obj.tag, item.taskId, index3)">{{obj2}}</NButton>
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
        </div>
      </div>
    </main>
    <footer
      class="sticky bottom-0 left-0 right-0 mt-4 bg-white py-4 dark:bg-[#111114]"
    >
      <NPagination
        v-if="dataSourcesLength"
        :display-order="['quick-jumper', 'pages', 'size-picker']"
        v-model:page="page"
        v-model:pageSize="pageSize"
        :page-sizes="[8, 16, 32, 64]"
        :item-count="dataSourcesLength"
        show-quick-jumper
        show-size-picker
        @update:page="onPageChange"
      ></NPagination>
    </footer>
  </div>
</template>