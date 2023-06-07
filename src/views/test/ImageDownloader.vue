<template>
  <div>
    <input type="text" v-model="imageUrl" placeholder="请输入图片链接" />
    <button @click="downloadAndCompressImage">下载并压缩图片</button>
    <img :src="imageUrl"/>
    <img v-if="compressedImage" :src="compressedImage" alt="压缩后的图片" />
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import axios from 'axios';

export default {
  setup() {
    const imageUrl = ref('https://oaidalleapiprodscus.blob.core.windows.net/private/org-anqnAmYeGOu1NlMCKW5bUN07/user-BlrDfbhGgoSNvGVhuj75ARCG/img-bzUpuhTNLoNldrKBjbamRIOI.png?st=2023-04-01T05%3A36%3A37Z&se=2023-04-01T07%3A36%3A37Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-03-31T18%3A07%3A04Z&ske=2023-04-01T18%3A07%3A04Z&sks=b&skv=2021-08-06&sig=GmqY5/47g2OvNtha%2B0JyQAoed0Qa1eUAzTydZjJLHUM%3D');
    const compressedImage = ref<string | null>(null);
    const proxyUrl = 'http://localhost:3002/fetch-image?url=';

    async function downloadAndCompressImage() {
      try {
        const response = await axios.get(proxyUrl + encodeURIComponent(imageUrl.value), {
          responseType: 'blob',
        });
        console.log(response,"====response");
        const imageBlob = response.data;

        const compressedBlob = await compressImage(imageBlob);

        compressedImage.value = URL.createObjectURL(compressedBlob);
      } catch (error) {
        console.error('下载或压缩图片时出错:', error);
      }
    }
    // const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

    // async function downloadAndCompressImage() {
    //   try {
    //     console.log("下载或压缩图片",imageUrl.value);
    //     // const response = await axios.get(imageUrl.value, {
    //     //   responseType: 'blob',
    //     // });
    //     const response = await getImgByUrl({ url: imageUrl.value });
    //     console.log(response,"===response");
    //     const imageBlob = response.data;
    //     console.log("下载或压缩图片3",imageBlob);
    //     const compressedBlob = await compressImage(imageBlob);

    //     compressedImage.value = URL.createObjectURL(compressedBlob);
    //   } catch (error) {
    //     console.error('下载或压缩图片时出错:', error);
    //   }
    // }

    async function compressImage(blob: Blob): Promise<Blob> {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = URL.createObjectURL(blob);
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
          }
          canvas.toBlob((compressedBlob) => {
            if (compressedBlob) {
              resolve(compressedBlob);
            }
          }, 'image/jpeg');
        };
      });
    }

    return {
      imageUrl,
      compressedImage,
      downloadAndCompressImage,
    };
  },
};
</script>
