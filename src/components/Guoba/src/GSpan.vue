<template>
  <span :class="spanClass">{{ spanValue }}</span>
</template>

<script setup lang="ts">
  import { useDesign } from '/@/hooks/web/useDesign';
  import { propTypes } from '/@/utils/propTypes';
  import { computed } from 'vue';

  const props = defineProps({
    value: propTypes.any,
    password: propTypes.bool.def(false),
  });
  const { prefixCls } = useDesign('g-span');

  const isEmpty = computed(() => {
    return props.value == null || props.value.length === 0;
  });

  const spanClass = computed(() => {
    return [
      prefixCls,
      {
        [`${prefixCls}-empty`]: isEmpty.value,
      },
    ];
  });

  const spanValue = computed(() => {
    if (isEmpty.value) {
      return '';
    } else {
      let value = props.value;
      if (Array.isArray(value)) {
        value = value.join(',');
      }
      if (props.password) {
        value = value.replace(/./g, '*').substring(0, 12);
      }
      return value;
    }
  });
</script>

<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-g-span';

  .@{prefix-cls} {
    &-empty {
      display: inline-block;
      width: 22px;
      height: 6px;
      background: #eaeaea;
      border-radius: 3px;
    }
  }
</style>
