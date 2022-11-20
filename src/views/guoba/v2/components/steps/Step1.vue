<template>
  <transition name="fade-slide" appear>
    <keep-alive>
      <component :is="stepsConfig[stepIdx]" v-bind="stepProps" />
    </keep-alive>
  </transition>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useStep } from './hooks';

  import Step1_1 from './Step1-1.vue';
  import Step1_2 from './Step1-2.vue';
  import Step1_3 from './Step1-3.vue';
  import Step1_4 from './Step1-4.vue';
  import { defHttp } from '/@/utils/http/axios';
  import lodash from 'lodash-es';
  import { sleep } from '/@/utils/common';

  const { createMessage: $message, createConfirm, createWarningModal } = useMessage();

  // @ts-ignore
  const [, { models, stepStore }] = useStep({}, {});

  const stepIdx = ref(0);
  const stepsConfig: any[] = [Step1_1, Step1_2, Step1_3, Step1_4];

  const stepProps = computed(() => {
    return {
      onPrev,
      onNext,
    };
  });

  function onPrev() {
    let idx = stepIdx.value - 1;
    if (idx === 2 && models.value.mode === 'full') {
      idx--;
    }
    if (idx < 0) {
      $message.warn('已是第一步');
    } else {
      stepIdx.value = idx;
    }
  }

  function onNext() {
    let idx = stepIdx.value + 1;
    if (idx === 2 && models.value.mode === 'full') {
      idx++;
    }
    if (idx === stepsConfig.length) {
      createConfirm({
        title: '开始迁移',
        iconType: 'warning',
        content: '你已完成所有的准备工作，请确认是否全部配置正确，并开始迁移吗？',
        okText: '开始迁移',
        async onOk() {
          await defHttp.post({
            url: '/v2-transfer/start',
            params: {
              config: lodash.omit(models.value, 'jsPluginInfo'),
            },
          });
          for (let i = 0; i < 3; i++) {
            await stepStore.updateStatus();
            if (stepStore.status.state !== 0) {
              return;
            }
            await sleep(300);
          }
          createWarningModal({ title: '错误', content: '获取启动状态失败，请手动刷新页面重试' });
        },
      });
    } else {
      stepIdx.value = idx;
    }
  }
</script>

<style scoped></style>
