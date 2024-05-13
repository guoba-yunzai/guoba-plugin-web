<template>
  <Card class="random-iamge-card" title="随机美图" style="min-height: 300px">
    <a-spin :spinning="loading" style="min-height: 150px">
      <div class="img" :style="divStyle" />
    </a-spin>
  </Card>
</template>
<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { Card } from 'ant-design-vue';
  import { defHttp } from '/@/utils/http/axios';

  const imgSrc = ref('');
  const loading = ref(false);
  const imgHeight = ref(500);

  const divStyle = computed(() => {
    let style: Recordable = {};
    style.backgroundImage = `url(${imgSrc.value})`;
    style.height = `${imgHeight.value}px`;
    return style;
  });

  async function loadImage() {
    try {
      loading.value = true;
      let res = await defHttp.get({ url: '/home/random-image', responseType: 'blob' }, { isTransformResponse: false, isReturnNativeResponse: true });
      let img = new Image();
      imgSrc.value = URL.createObjectURL(res.data);
      img.src = imgSrc.value;
      await new Promise((resolve) => (img.onload = resolve));
      // let height = img.height;
      // if (height > 500 || height < 500) {
      //   height = 500;
      // }
      imgHeight.value = 500;
    } finally {
      loading.value = false;
    }
  }

  loadImage();

  // @ts-ignored
  // noinspection JSUnusedGlobalSymbols
  const _components = { Card, divStyle };
</script>
<style lang="less">
  .random-iamge-card {
    .ant-card-body {
      padding: 8px;

      div.img {
        width: 100%;
        height: 500px;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
      }
    }
  }
</style>
