<template>
  <div class="step-box">
    <div class="step-tip">请选择安装V3云崽的方式</div>
    <transition-group name="fade-slide" mode="out-in" appear>
      <ModeBox v-model:active="models.installMode" :modeList="modeList.install" key="trans-install" />
      <transition name="fade-slide" mode="out-in" appear key="trans-1">
        <div v-if="models.installMode === 'new'" key="trans-git">
          <ModeBox v-model:active="models.gitAddress" :modeList="modeList.git" />
          <div class="lite-form">
            <PathSelect v-model:value="models.installPath" title="选择安装目录" :beforeSelect="pathBeforeSelect" />
          </div>
        </div>
        <div v-else-if="models.installMode === 'exist'" key="trans-input" class="lite-form">
          <PathSelect v-model:value="models.installPath" title="选择V3云崽地址" />
        </div>
        <span v-else></span>
      </transition>
    </transition-group>
    <StepBtn @register="onStepBtnRegister" />
  </div>
</template>

<script lang="ts" setup>
  import type { ModeItem } from './types';
  import { reactive, watch } from 'vue';
  import { useStep } from './hooks';
  import { PathSelect } from '/@/components/Guoba';
  import ModeBox from './ModeBox.vue';
  import StepBtn from './StepBtn.vue';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['prev', 'next']);
  const { createMessage: $message } = useMessage();

  // @ts-ignore
  const [onStepBtnRegister, { models }] = useStep(
    {
      nextBtn: {},
      prevBtn: { disabled: true },
      nextCheck() {
        if (!models.value.installPath) {
          $message.warn('请选择目录');
          return false;
        }
        return true;
      },
    },
    { emit },
  );

  watch(
    () => models.value.installPath,
    (val) => {},
    { immediate: true },
  );

  const modeList = reactive<Record<string, ModeItem[]>>({
    install: [
      {
        key: 'new',
        title: '全新下载',
        desc: '从Git上全新克隆一个项目',
        recommended: true,
      },
      {
        key: 'exist',
        title: '选择已有',
        desc: '选择本地已有的项目',
      },
    ],
    git: [
      {
        key: 'gitee',
        title: 'Gitee',
        desc: '使用Gitee克隆项目',
        recommended: true,
      },
      {
        key: 'github',
        title: 'Github',
        desc: '使用Github克隆项目',
      },
    ],
  });

  function pathBeforeSelect(path) {
    if (path && !/Yunzai-Bot[\\/]?$/i.test(path)) {
      let s = /\\/.test(path) ? '\\' : '/';
      s = path.endsWith(s) ? '' : s;
      return path + s + 'Yunzai-Bot';
    }
    return path;
  }
</script>

<style scoped></style>
