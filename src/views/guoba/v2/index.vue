<template>
  <a-spin :spinning="pageLoading" :tip="pageLoadingTip" :wrapper-class-name="prefixCls">
    <div class="transfer-container">
      <a-card class="box-card" title="迁移云崽">
        <TermsOfService v-if="!termsConfirm" @ok="onTermsOk" />
        <TransferBox v-else />
      </a-card>
    </div>
  </a-spin>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import TermsOfService from './components/TermsOfService.vue';
  import { ref, provide } from 'vue';
  import TransferBox from './components/TransferBox.vue';

  const { prefixCls } = useDesign('guoba-v2-update');
  const termsConfirm = ref(false);
  const pageLoading = ref(false);
  const pageLoadingTip = ref('加载中');
  const isMobile = ref(false);

  function onTermsOk() {
    termsConfirm.value = true;
  }

  function setPageLoading(loading: boolean, tip?: string) {
    pageLoading.value = loading;
    pageLoadingTip.value = tip ? tip : '加载中';
  }

  if (window.innerWidth <= 768) {
    isMobile.value = true;
  }

  provide('prefixCls', prefixCls);
  provide('isMobile', isMobile);
  provide('setPageLoading', setPageLoading);
</script>

<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-guoba-v2-update';

  .@{prefix-cls} {
    &.ant-spin-nested-loading,
    & > .ant-spin-container {
      width: 100%;
      height: 100%;
    }

    .transfer-container {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
    }

    .box-card {
      width: 100%;
      max-width: 800px;

      .ant-card-body {
        padding: 0;
      }

      .s-tip,
      .lite-form,
      .basic-form {
        margin: 8px auto 0;
        width: 380px;
        max-height: 480px;
        overflow: auto;
      }

      .s-tip {
        font-size: 12px;
        color: #666666;
      }

      .lite-form {
        text-align: center;
      }

      @media screen and (max-width: @screen-md) {
        height: 100%;

        .ant-card-body {
          height: calc(100% - 60px);
        }
      }
    }
  }
</style>
