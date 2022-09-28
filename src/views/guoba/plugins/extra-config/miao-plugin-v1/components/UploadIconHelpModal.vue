<template>
  <BasicModal
    title="上传图标功能说明"
    :width="400"
    :height="550"
    :draggable="false"
    :canFullscreen="false"
    @ok="onOk"
    @cancel="onCancel"
    @register="registerModal"
  >
    <div style="text-indent: 2em">
      <p>注：该功能不是上传小图标，而是上传一整张的大图标文件，例如下图示例：</p>
      <p>注：请严格按照每10个图标为一行、每个图标的大小为100×100的格式来上传。</p>
      <p>
        <img src="/resource/img/21ae6624.webp" alt="示例" style="margin: 0 auto" />
      </p>
      <p>若你要单独替换或上传单个的小图标，请点开图标选择界面，然后点击替换图标即可。</p>
    </div>

    <template #footer>
      <a-row type="flex" justify="space-between" style="align-items: center">
        <a-col>
          <a-checkbox v-model:checked="hide">烦诶，不要再提醒我啦</a-checkbox>
        </a-col>
        <a-col>
          <a-button @click="onCancel">取消</a-button>
          <a-button type="primary" @click="onOk">立即上传</a-button>
        </a-col>
      </a-row>
    </template>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { createLocalStorage } from '/@/utils/cache';

  const ls = createLocalStorage();
  const hide = ref(false);

  let callbackFn;

  const [registerModal, { closeModal }] = useModalInner((callback) => {
    callbackFn = callback;
  });

  function onOk() {
    if (hide.value) {
      ls.set('hide-upload-icon-help-modal', true);
    }
    callbackFn && callbackFn();
    closeModal();
  }

  function onCancel() {
    hide.value = false;
    closeModal();
  }
</script>

<style scoped></style>
