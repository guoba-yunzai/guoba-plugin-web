<template>
  <a-input :placeholder="placeholder" v-model:value="editCronValue" :disabled="disabled" style="width: 100%">
    <template #addonAfter>
      <!--suppress HtmlUnknownAttribute -->
      <a class="open-btn" :disabled="disabled ? 'disabled' : null" @click="open">
        <Icon icon="ant-design:setting-outlined" />
        <span>选择</span>
      </a>
    </template>
  </a-input>
</template>

<script setup lang="ts">
  import Icon from '/@/components/Icon/src/Icon.vue';
  import { propTypes } from '/@/utils/propTypes';
  import { ref, watch } from 'vue';

  const props = defineProps({
    value: propTypes.string.def(''),
    placeholder: propTypes.string.def('请输入cron表达式'),
    disabled: propTypes.bool.def(false),
  });
  const emit = defineEmits(['open', 'update:value']);

  const editCronValue = ref(props.value);

  watch(
    () => props.value,
    (newVal) => {
      if (newVal !== editCronValue.value) {
        editCronValue.value = newVal;
      }
    },
  );
  watch(editCronValue, (newVal) => {
    emit('update:value', newVal);
  });

  function open() {
    emit('open');
  }
</script>

<style scoped lang="less"></style>
