<template>
  <div :class="['transfer-box', { 'is-mobile': isMobile }]">
    <a-skeleton v-if="loading" active />
    <Step1 v-else-if="current === 1" />
    <Step2 v-else-if="current === 2" />
    <span v-else>error step {{ current }}</span>
  </div>
</template>

<script lang="ts" setup>
  import type { Ref } from 'vue';
  import { ref, inject, onMounted, watch } from 'vue';
  import Step1 from './steps/Step1.vue';
  import Step2 from './steps/Step2.vue';
  import { useStepStore } from './steps/hooks';

  const isMobile = inject<Ref<boolean>>('isMobile', ref(false));
  const stepStore = useStepStore();

  const loading = ref(true);
  const current = ref(1);
  const stepSize = ref('default');

  if (isMobile.value) {
    stepSize.value = 'small';
  }

  onMounted(async () => {
    await stepStore.updateStatus();
    watch(
      () => stepStore.status.state,
      (state) => {
        if (state === 0) {
          current.value = 1;
        } else {
          current.value = 2;
        }
      },
      { immediate: true },
    );
    loading.value = false;
  });
</script>

<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-guoba-v2-update';

  .@{prefix-cls} {
    .transfer-box {
      height: 600px;
      overflow-y: auto;
      padding: 12px;

      &.is-mobile {
        height: 100%;
      }

      .step-box {
        position: absolute;
        top: 120px;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;

        .step-tip {
          font-size: 18px;
          font-weight: bold;
        }

        .step-action {
          margin-top: 24px;
        }
      }

      .mode-box {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        margin-top: 24px;

        .mode-item {
          display: flex;
          flex-direction: column;
          width: 180px;
          height: 100px;
          border: 1px solid #e8e8e8;
          border-radius: 4px;
          margin: 0 12px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;

          &:hover {
            border-color: #6495ed;
          }

          &.active {
            color: #fff;
            background: #6495ed;
            border-color: #6495ed;

            .desc {
              color: #fff;
            }
          }

          .title {
            font-size: 16px;
            font-weight: bold;
            padding: 12px 0;
            text-align: center;
          }

          .desc {
            font-size: 14px;
            text-align: center;
            color: #999;
          }

          &.recommended:after {
            content: '推荐';
            position: absolute;
            top: 0;
            right: 0;
            padding: 0 4px;
            background-color: #6495ed;
            color: #fff;
            font-size: 12px;
            border-radius: 0 0 0 4px;
            transform: scale(0.8);
            // 设置圆心为右上角
            transform-origin: 100% 0;
          }
        }
      }
    }
  }
</style>
