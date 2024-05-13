<template>
  <a-space class="step-action">
    <a-button preIcon="ant-design:arrow-left" :disabled="getProps.prevBtn.disabled" @click="() => onClickCommon('prevBtn')">
      <span>{{ getProps.prevBtn.text }}</span>
    </a-button>
    <a-button type="primary" postIcon="ant-design:arrow-right" :disabled="getProps.nextBtn.disabled" @click="() => onClickCommon('nextBtn')">
      <span>{{ getProps.nextBtn.text }}</span>
    </a-button>
  </a-space>
</template>

<script lang="ts" setup>
  import type { StepBtnProps, StepBtnItem } from './types';
  import { computed, reactive } from 'vue';
  import lodash from 'lodash-es';

  const props = defineProps({
    prevBtn: Object,
    nextBtn: Object,
  });
  const emit = defineEmits(['register']);

  const innerProps = reactive<StepBtnProps>({
    prevBtn: { text: '上一步' },
    nextBtn: { text: '下一步' },
  });

  const getProps = computed<StepBtnProps>(() => lodash.merge({}, props, innerProps));

  emit('register', {
    setProps,
  });

  function setProps(props: StepBtnProps) {
    lodash.merge(innerProps, props);
  }

  function onClickCommon(btnName: string) {
    let item = getProps.value[btnName] as StepBtnItem;
    if (typeof item?.onClick === 'function') {
      item.onClick();
    }
  }
</script>

<style scoped></style>
