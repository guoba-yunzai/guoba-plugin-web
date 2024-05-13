<template>
  <div class="step-box">
    <div v-if="failed" class="step-tip">迁移失败</div>
    <div v-else-if="percent === 100" class="step-tip">迁移成功</div>
    <div v-else class="step-tip">
      <span>正在迁移中</span>
      <LoadingOutlined />
    </div>
    <br />
    <Progress type="circle" :percent="percent" :status="failed ? 'exception' : undefined" />
    <br />
    <div style="width: 90%">
      <Alert v-if="failed" :message="`迁移失败：${reason}`" type="error" show-icon />
      <Alert v-else-if="percent === 100" message="迁移成功！快去愉快地玩耍吧！" type="success" show-icon />
      <Alert v-else message="在迁移结束之前，请勿重启或关闭云崽" type="warning" show-icon />
      <br />
      迁移日志：
      <a-textarea ref="logRef" :value="logs" :auto-size="{ minRows: 10, maxRows: 10 }" />
      <a-row v-if="percent !== 100" class="footer-btn">
        <a-col :span="12">
          <a-button v-if="failed" type="link" preIcon="ant-design:undo" @click="onBack"> 返回重新选择配置 </a-button>
        </a-col>
        <a-col :span="12" style="text-align: right">
          <template v-if="failed"></template>
          <!--          <a-button v-if="failed" type="link" preIcon="ant-design:redo" @click="onCancel">-->
          <!--            重新尝试迁移-->
          <!--          </a-button>-->
          <a-button v-else type="link" danger preIcon="ant-design:close-circle" @click="onCancel"> 取消迁移 </a-button>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, watch, onMounted, nextTick } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Progress, Alert } from 'ant-design-vue';
  import { LoadingOutlined } from '@ant-design/icons-vue';
  import { useStepStore } from './hooks';
  import { defHttp } from '/@/utils/http/axios';

  const { createConfirm } = useMessage();
  const stepStore = useStepStore();

  const logRef = ref();
  const failed = computed(() => stepStore.status.state === 3);
  const reason = computed(() => stepStore.status.reason);
  const percent = computed(() => stepStore.status.percent);
  const logs = computed(() => stepStore.status.logs.join('\n'));

  onMounted(() => {
    watchLogs();
    watchPercent();
  });

  function onCancel() {
    createConfirm({
      title: '取消迁移',
      iconType: 'warning',
      content: '确定要取消迁移吗？取消后不会删除已迁移的文件，但下次迁移时就只能从头开始了。',
      async onOk() {
        await defHttp.put({ url: '/v2-transfer/stop' });
        await stepStore.updateStatus();
      },
    });
  }

  function onBack() {
    createConfirm({
      title: '返回',
      iconType: 'warning',
      content: '确定要重置迁移状态并返回吗？',
      async onOk() {
        await defHttp.post({ url: '/v2-transfer/reset' });
        await stepStore.updateStatus();
      },
    });
  }

  function watchPercent() {
    watch(
      [percent, failed],
      () => {
        if (percent.value >= 100 || failed.value) {
          stepStore.stopPolling();
        } else {
          stepStore.startPolling();
        }
      },
      { immediate: true },
    );
  }

  function watchLogs() {
    let isFirst = true;
    watch(
      logs,
      async () => {
        await nextTick();
        if (logRef.value?.resizableTextArea?.textArea) {
          let textArea = logRef.value.resizableTextArea.textArea as HTMLTextAreaElement;
          // let { scrollTop, clientHeight, scrollHeight } = textArea;
          // let realTop = scrollTop + clientHeight;
          // if (isFirst || (scrollHeight > clientHeight && realTop >= scrollHeight - 50)) {
          //   isFirst = false;
          //   textArea.scrollTop = scrollHeight;
          // }
          textArea.scrollTop = textArea.scrollHeight;
        }
      },
      { immediate: true, deep: true },
    );
  }
</script>

<style scoped lang="less">
  .footer-btn {
    .ant-btn {
      padding: 0;
    }
  }
</style>
