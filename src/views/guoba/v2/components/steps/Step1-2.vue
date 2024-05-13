<template>
  <div class="step-box">
    <div class="step-tip">请选择迁移模式</div>
    <transition-group name="fade-slide" mode="out-in" appear>
      <ModeBox v-model:active="models.mode" :modeList="modeList.mode" key="trans-mode" />
      <transition name="fade-slide" mode="out-in" appear key="trans-1">
        <div v-if="models.mode === 'full'" class="s-tip">
          <span>全量迁移会完整复制“data”文件夹，以及redis中用户uid的绑定关系。</span>
        </div>
        <div v-else-if="models.mode === 'choose'" class="s-tip">
          <span style="color: red">[不推荐] </span>
          <span> 选择迁移可选择迁移哪些项目。由于plugin可能会将数据存放到data文件夹， 如果使用选择迁移，锅巴无法考虑到所有插件，极有可能导致数据丢失！ </span>
        </div>
        <span v-else></span>
      </transition>
    </transition-group>
    <StepBtn @register="onStepBtnRegister" />
  </div>
</template>

<script lang="ts" setup>
  import type { ModeItem } from './types';
  import { reactive } from 'vue';

  import { useStep } from './hooks';
  import ModeBox from './ModeBox.vue';
  import StepBtn from './StepBtn.vue';

  const emit = defineEmits(['prev', 'next']);

  // @ts-ignore
  const [onStepBtnRegister, { models }] = useStep({}, { emit });

  const modeList = reactive<Record<string, ModeItem[]>>({
    mode: [
      {
        key: 'full',
        title: '全量迁移',
        desc: '完整复制“data”文件夹',
        recommended: true,
      },
      {
        key: 'choose',
        title: '选择迁移',
        desc: '选择要迁移的项目',
      },
    ],
  });
</script>

<style scoped></style>
