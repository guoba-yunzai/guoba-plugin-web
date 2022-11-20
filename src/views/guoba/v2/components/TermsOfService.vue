<template>
  <div class="terms-box">
    <p style="text-indent: 0">亲爱的V2云崽用户： </p>
    <p>TODO: 内容待补充</p>
  </div>

  <div class="footer">
    <a-button type="primary" @click="emit('ok')">同意以上条款并开始使用</a-button>
  </div>
</template>

<script lang="ts" setup>
  const emit = defineEmits(['ok']);
</script>

<style scoped lang="less">
  .footer {
    text-align: center;
    border-top: 1px solid #e0e0e0;
    padding: 8px 0;
  }

  .terms-box {
    //height: 100%;
    max-height: 600px;
    overflow-y: auto;
    padding: 12px;

    @media screen and (max-width: @screen-md) {
      max-height: calc(100% - 48px);
    }

    p {
      text-indent: 2em;
    }

    h2 {
      display: block;
      font-size: 1.5em;
      margin-block-start: 0.83em;
      margin-block-end: 0.83em;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
      font-weight: bold;
    }

    h3 {
      display: block;
      font-size: 1.17em;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
      font-weight: bold;
    }

    h4 {
      display: block;
      margin-block-start: 1.33em;
      margin-block-end: 1.33em;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
      font-weight: bold;
    }

    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
      padding-inline-start: 40px;
    }

    ul {
      display: block;
      list-style-type: disc;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
      padding-inline-start: 40px;
    }
  }
</style>
