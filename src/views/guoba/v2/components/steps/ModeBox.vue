<template>
  <div class="mode-box">
    <template v-for="item of modeList" :key="item.key">
      <div
        :class="[
          'mode-item',
          {
            recommended: item.recommended,
            active: active === item.key,
          },
        ]"
        @click="onClick(item)"
      >
        <div class="title">{{ item.title }}</div>
        <div class="desc">{{ item.desc }}</div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import type { ModeItem } from './types';

  const props = defineProps({
    active: {
      type: [Number, String],
      default: '',
    },
    modeList: {
      type: Array as PropType<ModeItem[]>,
      default: () => [],
    },
    allowCancel: Boolean,
  });
  const emit = defineEmits(['update:active']);

  function onClick(item: ModeItem) {
    if (item.key === props.active) {
      if (props.allowCancel) {
        emit('update:active', '');
      }
    } else {
      emit('update:active', item.key);
    }
  }
</script>

<!--<style lang="scss"></style>-->
