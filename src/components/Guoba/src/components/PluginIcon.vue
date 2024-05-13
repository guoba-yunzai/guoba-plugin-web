<template>
  <img v-if="plugin.iconPath" :class="[`${prefixCls}-img`]" :src="plugin.iconPath" alt="" :style="imgStyle" />
  <Icon v-else-if="plugin.icon" :icon="plugin.icon" :color="plugin.iconColor" :size="size" />
  <Icon v-else icon="clarity:plugin-line" :size="size" />
</template>

<script setup lang="ts">
  import type { Plugin } from '/#/guoba';
  import { computed } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { Icon } from '/@/components/Icon';

  const { prefixCls } = useDesign('g-plugin-icon');

  const props = defineProps({
    plugin: {
      type: Object as PropType<Plugin>,
      required: true,
    },
    size: {
      type: Number,
      default: 16,
    },
  });

  const imgStyle = computed(() => {
    return {
      width: `${props.size}px`,
      height: `${props.size}px`,
    };
  });
</script>

<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-g-plugin-icon';

  .@{prefix-cls} {
    &-img {
      width: 16px;
      height: 16px;
      display: inline-block;
    }
  }
</style>
