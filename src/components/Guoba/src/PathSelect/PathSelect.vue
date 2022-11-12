<template>
  <a-input class="file-select-input" :value="value" readonly :placeholder="title">
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
  });
  const emit = defineEmits(['update:value']);

  const [registerModal, { openModal }] = useModal();

  function onOpen() {
    openModal(true, props);
  }

  function onSelect(path) {
    emit('update:value', path);
  }
</script>

<style scoped>
  .file-select-input {
    width: 100%;
  }
</style>
