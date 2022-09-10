<template>
  <PageWrapper :class="[prefixCls]" title="编辑喵喵帮助" dense sticky stickyTop="-14px" :loading="loading">
    <template #headerContent>
      <EditMiaoHeader @save="saveData" @rollback="onRollback" @backup="onBackup" />
    </template>
    <div class="flex justify-center md:pt-4 my-4">
      <Transition name="scroll-y-reverse-transition">
        <HelpPanel
          v-if="!pageLoading"
          v-model:helpCfg="helpCfg"
          v-model:helpList="helpList"
          v-model:bgB64="bgB64"
          v-model:mainB64="mainB64"
          v-model:iconB64List="iconB64List"
          v-model:modelData="modelData"
        />
      </Transition>
    </div>
    <BackupDrawer @register="registerDrawer" @reload="loadData" />
  </PageWrapper>
</template>

<script lang="ts">
  import {defineComponent, ref} from 'vue';
  import type {
    helpCfgType,
    helpListType,
    modelDataType,
  } from './types'

  import { useMessage } from '/@/hooks/web/useMessage'
  import {PageWrapper} from '/@/components/Page';
  import EditMiaoHeader from "./components/MiaoHeader.vue";
  import HelpPanel from "./components/HelpPanel.vue";
  import BackupDrawer from "./components/BackupDrawer.vue";
  import { useDesign } from '/@/hooks/web/useDesign'
  import {
    getHelpIconList,
    getMiaoHelpCfg,
    getThemeBgBase64,
    getThemeMainBase64,
    saveMiaoHelpCfg,
  } from './miao.api'
  import { useDrawer } from '/@/components/Drawer'

  export default defineComponent({
    name: 'MiaoPluginExtra',
    components: {HelpPanel, EditMiaoHeader, PageWrapper, BackupDrawer},
    setup() {
      const {prefixCls} = useDesign('edit-miao-help')
      const {createMessage : $message, createConfirm} = useMessage()
      const pageLoading = ref<boolean>(true)
      const loading = ref<boolean>(true)
      const helpCfg = ref<Nullable<helpCfgType>>(null);
      const helpList = ref<Nullable<helpListType>>(null);
      const bgB64 = ref<Nullable<string>>(null)
      const mainB64 = ref<Nullable<string>>(null)
      const iconB64List = ref<Nullable<string[]>>(null)
      const modelData = ref<modelDataType>({
        show: false,
        cell: null,
        cellIndex: null,
        group: null,
        groupIndex: null
      })
      const [registerDrawer, {openDrawer}] =useDrawer()

      const saveData = async () => {
        try {
          loading.value = true
          // 保存配置
          await saveMiaoHelpCfg(helpCfg, helpList, iconB64List, mainB64)
          $message.success('保存成功~')
        }finally {
          loading.value = false
        }
      }

      const loadData = async () => {
        try {
          loading.value = true
          let result = await getMiaoHelpCfg()
          helpCfg.value = result.helpCfg
          helpList.value = result.helpList
          bgB64.value = await getThemeBgBase64()
          mainB64.value = await getThemeMainBase64()
          iconB64List.value = await getHelpIconList()
        } finally {
          loading.value = false
          pageLoading.value = false
        }
      }

      loadData()

      function onBackup() {
        openDrawer(true, {})
      }

      function onRollback() {
        createConfirm({
          title: '提示',
          iconType: 'warning',
          content: '确定要放弃所有修改吗？',
          onOk: () => {
            loadData()
          }
        })
      }

      return {
        prefixCls,
        loading,
        pageLoading,
        helpCfg,
        helpList,
        bgB64,
        mainB64,
        iconB64List,
        modelData,
        onBackup,
        onRollback,
        loadData,
        saveData,
        registerDrawer,
      }
    }
  })
</script>
<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-edit-miao-help';

  .@{prefix-cls} {
    .ant-page-header {
      padding-right: 8px;
      padding-bottom: 8px;
    }

    @media screen and (max-width: 800px) {
      .size {
        height: 0;
        padding-top: 15.16%;
        position: relative;
      }
    }
  }
</style>
