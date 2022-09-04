<template>
  <div>
    <a-skeleton v-if="loading" active />
    <MarkdownViewer v-if="readmeText" :value="readmeText" @initOk="onInitOk" />
  </div>
</template>

<script lang="ts" setup>
  import { defHttp } from '/@/utils/http/axios';
  import { ref } from 'vue';
  import MarkdownViewer from '/@/components/Markdown/src/MarkdownViewer.vue';

  // noinspection JSUnusedGlobalSymbols
  const _components = { MarkdownViewer };

  const todoUrl = 'https://gitee.com/guoba-yunzai/resources/raw/master/other/TODO.md';

  const url = '/helper/transit?url=' + encodeURIComponent(todoUrl);

  let _resolve;
  let mounted = new Promise((r) => (_resolve = r));

  const loading = ref(false);
  const readmeText = ref('');

  function onInitOk() {
    _resolve();
  }

  async function load() {
    loading.value = true;
    readmeText.value = await defHttp.get({ url }, { isTransformResponse: false });
    await mounted;
    loading.value = false;
  }

  load();
</script>

<style scoped></style>
