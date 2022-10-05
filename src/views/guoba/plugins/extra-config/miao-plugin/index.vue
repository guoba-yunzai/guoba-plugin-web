<template>
  <PageWrapper
    :class="[prefixCls]"
    title="编辑喵喵帮助"
    dense
    sticky
    stickyTop="-14px"
    :loading="loading"
  >
    <template #headerContent>
      <EditMiaoHeader
        @save="saveData"
        @rollback="onRollback"
        @backup="onBackup"
        @theme="onOpenTheme"
      />
    </template>
    <div class="flex justify-center md:pt-4 my-4">
      <Transition name="scroll-y-reverse-transition">
        <HelpPanel
          v-if="!pageLoading"
          :cacheVer="cacheVer"
          :versions="versions"
          :themeNames="themeNames"
          v-model:helpCfg="helpCfg"
          v-model:helpList="helpList"
          v-model:bgB64="bgB64"
          v-model:mainB64="mainB64"
          v-model:iconB64List="iconB64List"
          v-model:modelData="modelData"
          v-model:themeStyle="themeStyle"
          v-model:themeName="themeName"
          @openSetting="onOpenSetting"
        />
      </Transition>
    </div>
    <ThemeDrawer v-model:themeNames="themeNames" @register="registerThemeDrawer" />
    <BackupDrawer @register="registerBackupDrawer" @reload="loadData" />
    <SettingDrawer
      v-model:model="helpCfg"
      :themeName="themeName"
      :themeNames="themeNames"
      v-model:themeStyle="themeStyle"
      v-model:debugThemeName="debugThemeName"
      @register="registerSettingDrawer"
      @update:model="onSettingModalChange"
    />
  </PageWrapper>
</template>

<script lang="ts">
  import type { helpCfgType, helpListType, modelDataType } from './types';
  import { defineComponent, reactive, ref, watch } from 'vue';
  import lodash from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { PageWrapper } from '/@/components/Page';
  import EditMiaoHeader from './components/MiaoHeader.vue';
  import HelpPanel from './components/HelpPanel.vue';
  import ThemeDrawer from './components/ThemeDrawer.vue';
  import BackupDrawer from './components/BackupDrawer.vue';
  import SettingDrawer from './components/SettingDrawer.vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { getHelpIconList, getMiaoHelpCfg, saveMiaoHelpCfg } from './miao.api';
  import { useDrawer } from '/@/components/Drawer';

  export default defineComponent({
    name: 'MiaoPluginExtra',
    components: {
      HelpPanel,
      EditMiaoHeader,
      PageWrapper,
      ThemeDrawer,
      BackupDrawer,
      SettingDrawer,
    },
    setup() {
      const { prefixCls } = useDesign('edit-miao-help');
      const { createMessage: $message, createConfirm } = useMessage();
      const pageLoading = ref<boolean>(true);
      const loading = ref<boolean>(true);
      const cacheVer = ref<number>(0);
      const helpCfg = ref<Nullable<helpCfgType>>(null);
      const helpList = ref<Nullable<helpListType>>(null);
      const bgB64 = ref<Nullable<string>>(null);
      const mainB64 = ref<Nullable<string>>(null);
      const iconB64List = ref<Nullable<string[]>>(null);
      const versions = reactive({
        miao: 'x.x.x',
        yunzai: 'x.x.x',
      });
      const modelData = ref<modelDataType>({
        show: false,
        cell: null,
        cellIndex: null,
        group: null,
        groupIndex: null,
      });
      const themeNames = ref<string[]>([]);
      const themeStyle = ref<Recordable>({});
      const debugThemeName = ref<Nullable<string>>('');

      // 当前正在预览的皮肤名称
      const themeName = ref<string>();
      let cacheThemeName: string | -1 | null = null;

      watch(
        [debugThemeName, () => helpCfg.value?.theme, () => helpCfg.value?.themeExclude],
        () => {
          themeName.value = (() => {
            if (typeof cacheThemeName === 'string') {
              return cacheThemeName;
            }
            if (debugThemeName.value) {
              return debugThemeName.value as string;
            }
            let ret: string[] = [];
            let theme = helpCfg.value?.theme;
            let exclude = helpCfg.value?.themeExclude;
            let names = themeNames.value as string[];
            if (lodash.isArray(theme)) {
              ret = lodash.intersection(theme, names);
            } else if (theme === 'all') {
              ret = names;
            }
            if (exclude && lodash.isArray(exclude)) {
              ret = lodash.difference(ret, exclude);
            }
            if (ret.length === 0) {
              ret = ['default'];
            }
            let tempName = lodash.sample(ret) as string;
            if (names && names.length > 0 && cacheThemeName == null) {
              cacheThemeName = tempName;
            }
            return tempName;
          })();
        },
        { deep: true, immediate: true },
      );

      const [registerThemeDrawer, themeDrawer] = useDrawer();
      const [registerBackupDrawer, backupDrawer] = useDrawer();
      const [registerSettingDrawer, settingDrawer] = useDrawer();

      // 解决打开 setting 弹窗时，由于 helpCfg 变更，有可能更换一次皮肤的问题
      function onSettingModalChange() {
        setTimeout(() => (cacheThemeName = -1), 300);
      }

      const saveData = async () => {
        try {
          loading.value = true;
          // 保存配置
          await saveMiaoHelpCfg(helpCfg, helpList, iconB64List, mainB64);
          await loadData();
          $message.success('保存成功~');
        } finally {
          loading.value = false;
        }
      };

      const loadData = async () => {
        try {
          loading.value = true;
          let result = await getMiaoHelpCfg();
          helpCfg.value = result.helpCfg;
          helpList.value = result.helpList;
          themeNames.value = result.themeNames;
          versions.miao = result.miaoVersion;
          versions.yunzai = result.yunzaiVersion;
          bgB64.value = null;
          mainB64.value = null;
          iconB64List.value = await getHelpIconList();
        } finally {
          loading.value = false;
          pageLoading.value = false;
          cacheVer.value++;
        }
      };

      loadData();

      function onBackup() {
        backupDrawer.openDrawer(true, {});
      }

      function onOpenTheme() {
        themeDrawer.openDrawer(true, {});
      }

      function onRollback() {
        createConfirm({
          title: '提示',
          iconType: 'warning',
          content: '确定要放弃所有修改吗？',
          onOk: () => {
            loadData();
          },
        });
      }

      function onOpenSetting() {
        settingDrawer.openDrawer();
      }

      return {
        prefixCls,
        loading,
        pageLoading,
        helpCfg,
        helpList,
        themeNames,
        themeStyle,
        themeName,
        debugThemeName,
        bgB64,
        mainB64,
        iconB64List,
        cacheVer,
        versions,
        modelData,
        onBackup,
        onOpenTheme,
        onRollback,
        onOpenSetting,
        loadData,
        saveData,
        onSettingModalChange,
        registerThemeDrawer,
        registerBackupDrawer,
        registerSettingDrawer,
      };
    },
  });
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
