<template>
  <div class="lg:flex  justify-between">
    <div class="text-lg text-md m-1">编辑喵喵帮助</div>
    <div>
      <a-button class="mr-4" type="primary" danger @click="rollback">回滚</a-button>
      <a-button class="mr-4" type="primary" @click="backup">备份</a-button>
      <a-button class="mr-4" type="success" @click="save">保存</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>

  const emits = defineEmits([
    "onSave",
    "onRollback",
    "onBackup"
  ])

  const save = () => {
    emits("onSave")
  }

  const rollback = () => {
    emits("onRollback")
  }

  const backup = () => {
    emits("onBackup")
  }
</script>

<style scoped>

</style>
