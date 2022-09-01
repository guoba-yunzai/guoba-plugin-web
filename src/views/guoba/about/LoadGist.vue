<template>
  <div id="load-gist"></div>
</template>

<script lang="ts" setup>
  import { defHttp } from '/@/utils/http/axios';
  import { onMounted } from 'vue';

  const gistUrl = 'https://gist.github.com/sjlei/7edba626fed9201a87b0a48b363a59f6.js';

  const url = '/helper/transit?url=' + encodeURIComponent(gistUrl);

  let _resolve;
  let mounted = new Promise((r) => (_resolve = r));
  // onMounted 只能放到 setup 内部
  onMounted(() => _resolve());

  async function load() {
    let body = await defHttp.get({ url }, { isTransformResponse: false });
    if (!body) {
      return;
    }
    let lines = body.split('\n');
    let html = [];
    for (let i = 0; i < lines.length; i++) {
      // 正则替换掉开头的document.write
      lines[i] = lines[i].replace(/^document\.write\(/, `html.push(`);
    }
    // console.log(html.join('\n'));
    eval(lines.join('\n'));
    await mounted;
    document.getElementById('load-gist')!.innerHTML = html.join('\n');
  }

  load();
</script>

<style scoped></style>
