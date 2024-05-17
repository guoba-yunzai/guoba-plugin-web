<template>
  <span :class="[prefixCls, 'my-guoba-button-1', 'my-guoba-button-2', 'my-guoba-button-3']">
    <BasicButton v-bind="$attrs">
      <span v-if="btnText">
        {{ btnText }}
      </span>
      <slot v-else></slot>
    </BasicButton>
  </span>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import Button from '/@/components/Button/src/BasicButton.vue';

  export default defineComponent({
    name: 'GuobaButton',
    components: {
      BasicButton: Button,
    },
    props: {
      btnText: {
        type: [String],
        default: 'ahh',
      },
    },
    setup(_props, ctx) {
      // const { prefixCls } = useDesign('guoba-custom__button');
      const prefixCls = 'guoba-custom__button';

      console.log('[Guoba] 欢迎使用 GuobaButton');

      return {
        prefixCls,
        attrs: ctx.attrs,
      };
    },
  });
</script>

<style>
  .my-guoba-button-2 {
    display: inline-block;
    padding: 20px;
    /*background-color: pink;*/
    border-top: 4px solid pink;
  }
</style>
<!--suppress LessUnresolvedVariable -->
<style lang="less">
  /*@prefix-cls: ~'@{namespace}-guoba-custom__button';*/
  @prefix-cls: ~'guoba-custom__button';

  .@{prefix-cls} {
    display: inline-block;
    padding: 20px;
    border-left: 4px solid blue;
  }

  .my-guoba-button-1 {
    display: inline-block;
    padding: 20px;
    border-right: 4px solid red;
  }
</style>
