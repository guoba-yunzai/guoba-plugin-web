<template>
  <div style="margin-top: 80px; text-align: center">
    <img :src="construction" alt="" style="margin: 0 auto" />
    <div style="font-size: 1.2rem; padding: 20px 0; font-weight: bold">
      <span>当前页面正在施工中，敬请期待~</span>
    </div>
  </div>
</template>

<script lang="ts">
  import construction from '/@/assets/images/construction.png';

  export default {
    name: 'PageCoding',
    setup() {
      return {
        construction,
      };
    },
  };
</script>

<style scoped></style>
