<template>
  <a-input
    class="file-select-input"
    :value="value"
    :placeholder="title"
    @update:value="updateValue"
  >
    <template #addonAfter>
      <span @click="onOpen" style="cursor: pointer">选择</span>
    </template>
  </a-input>
  <PathSelectModal @register="registerModal" @select="onSelect" />
</template>

<script lang="ts" setup>
  import { useModal } from '/@/components/Modal';
  import PathSelectModal from './components/PathSelectModal.vue';

  const props = defineProps({
    value: String,
    title: {
      type: String,
      default: '选择目录',
    },
    onlyDir: {
      type: Boolean,
      default: true,
    },
    beforeSelect: Function,
  });
  const emit = defineEmits(['update:value']);

  const [registerModal, { openModal }] = useModal();

  function onOpen() {
    openModal(true, props);
  }

  function onSelect(path) {
    if (typeof props.beforeSelect == 'function') {
      path = props.beforeSelect(path);
    }
    updateValue(path);
  }

  function updateValue(value) {
    emit('update:value', value);
  }
</script>

<style scoped>
  .file-select-input {
    width: 100%;
  }
</style>
