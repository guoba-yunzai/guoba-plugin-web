<template>
  <div class="lg:flex justify-between">
    <div class="text-lg text-md m-1"></div>
    <div>
      <a-button class="mr-2" type="primary" preIcon="ant-design:undo" danger @click="rollback"> 回滚 </a-button>
      <a-button class="mr-2" type="primary" preIcon="icon-park-outline:theme" @click="onTheme"> 皮肤 </a-button>
      <a-button class="mr-2" type="primary" preIcon="dashicons:backup" @click="backup"> 备份 </a-button>
      <a-button class="" type="success" preIcon="ant-design:save" @click="save">保存</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const emit = defineEmits(['save', 'rollback', 'backup', 'theme']);

  const save = () => {
    emit('save');
  };

  const rollback = () => {
    emit('rollback');
  };

  const backup = () => {
    emit('backup');
  };

  function onTheme() {
    emit('theme');
  }
</script>

<style scoped></style>
