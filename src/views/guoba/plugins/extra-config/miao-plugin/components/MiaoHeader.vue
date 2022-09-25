<template>
  <div class="lg:flex justify-between">
    <div class="text-lg text-md m-1"></div>
    <div>
      <a-button class="mr-2" type="primary" preIcon="ant-design:undo" danger @click="rollback"
        >回滚</a-button
      >
      <a-button class="mr-2" type="primary" preIcon="dashicons:backup" @click="backup"
        >备份</a-button
      >
      <a-button class="" type="success" preIcon="ant-design:save" @click="save">保存</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const emits = defineEmits(['save', 'rollback', 'backup']);

  const save = () => {
    emits('save');
  };

  const rollback = () => {
    emits('rollback');
  };

  const backup = () => {
    emits('backup');
  };
</script>

<style scoped></style>
