<template>
  <BasicModal v-bind="getProps">
    <a-spin :spinning="loading || (activeKey === 'readme' && !initOk)" :tip="loadingTip">
      <a-empty v-if="!plugin" description="插件加载失败" />
      <a-tabs v-else v-model:active-key="activeKey">
        <a-tab-pane tab="详情" key="desc">
          <Description @register="registerDesc" :data="plugin" />
        </a-tab-pane>
        <a-tab-pane v-if="plugin?.hasConfig" tab="配置" key="config">
          <PluginConfigForm v-if="!plugin?.showInMenu && showConfigForm" ref="configFormRef" :plugin="plugin" />
        </a-tab-pane>
        <a-tab-pane tab="README" key="readme">
          <div v-if="loading"></div>
          <a-empty v-else-if="!readme" description="README读取失败" />
          <MarkdownViewer v-else :value="readme" @initOk="onInitOk" />
        </a-tab-pane>
      </a-tabs>
    </a-spin>
    <template #footer>
      <a-row type="flex" justify="space-between">
        <a-col>
          <template v-if="['desc'].includes(activeKey)">
            <a-button v-if="!plugin?.installed" type="primary" @click="installNow"> 立即安装</a-button>
            <a-button v-else type="primary" danger :disabled="['miao-plugin'].includes(plugin.name)" @click="uninstall"> 卸载 </a-button>
          </template>
        </a-col>
        <a-col>
          <template v-if="['desc', 'readme'].includes(activeKey)">
            <a-button @click="close">关闭</a-button>
          </template>
          <template v-if="['config'].includes(activeKey)">
            <a-button type="primary" preIcon="ant-design:save" @click="saveConfig">保存</a-button>
          </template>
        </a-col>
      </a-row>
    </template>
  </BasicModal>
</template>

<script lang="tsx">
  import type { Plugin } from '/#/guoba';
  import type { ModalProps } from '/@/components/Modal';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { computed, defineComponent, ref, unref, watch } from 'vue';
  import { Checkbox } from 'ant-design-vue';
  import { Description, useDescription } from '/@/components/Description';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useDesign } from '/@/hooks/web/useDesign';
  import Scrollbar from '/@/components/Scrollbar/src/Scrollbar.vue';
  import { pluginApi } from '/@/api/guoba';
  import { MarkdownViewer } from '/@/components/Markdown';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getStatusTags } from '/@/hooks/guoba';
  import PluginConfigForm from './components/PluginConfigForm.vue';
  import { sleep } from '/@/utils/common';
  import { parseAuthorLink } from '/@/utils/guoba';
  import { useGo } from '/@/hooks/web/usePage';

  export default defineComponent({
    name: 'GPluginModal',
    components: {
      PluginConfigForm,
      Scrollbar,
      BasicModal,
      Description,
      MarkdownViewer,
    },
    emits: ['register', 'success'],
    setup(props) {
      const configFormRef = ref();
      const attrs = useAttrs();
      const { prefixCls } = useDesign('g-plugin-modal');
      const { createMessage: $message, createConfirm } = useMessage();
      const go = useGo();

      // 当前是否正在加载中
      const loading = ref(false);
      const loadingTip = ref('');
      const initOk = ref(false);
      const activeKey = ref('desc');
      const plugin = ref<Plugin>();
      const readme = ref('');
      // 注册弹窗
      const [registerModal, { closeModal, setModalProps, getVisible }] = useModalInner(open);
      // 注册表单
      const [registerDesc, {}] = useDescription({
        column: 1,
        schema: [
          { label: '插件标题', field: 'title' },
          { label: '插件名称', field: 'name' },
          {
            label: '插件作者',
            field: 'author',
            render: (_, record) => {
              return parseAuthorLink(record);
            },
          },
          {
            label: '插件链接',
            field: 'link',
            render: (val) => (
              <a href={val} target="_blank">
                {val}
              </a>
            ),
          },
          { label: '插件说明', field: 'description' },
          {
            label: '状态',
            field: 'installed',
            render: (_, record) => getStatusTags(record as Plugin, 0),
          },
          // { label: '图标', field: 'icon' },
          // { label: '图标颜色', field: 'color' },
        ],
      });

      // 弹窗最终props
      const getProps = computed(() => {
        let modalProps: Partial<ModalProps> = {
          width: 800,
          title: '插件详情',
          wrapClassName: prefixCls,
          confirmLoading: unref(loading),
          showOkBtn: false,
          cancelText: '关闭',
        };
        let finalProps: Recordable = {
          ...unref(attrs),
          ...modalProps,
          ...props,
          onOk: close,
          onCancel: close,
          onRegister: registerModal,
        };
        return finalProps;
      });

      watch(activeKey, (val) => {
        if (val === 'readme') {
          if (readme.value) {
            getReadme();
          }
        } else if (val === 'config') {
          if (plugin.value?.showInMenu) {
            // 跳转到插件详情页
            go(`/plugin/@/${plugin.value.name}`);
            close();
          }
        }
      });

      const showConfigForm = ref(false);

      watch(getVisible!, async (val) => {
        if (val) {
          await sleep(300);
          showConfigForm.value = true;
        } else {
          await sleep(300);
          showConfigForm.value = false;
        }
      });

      /** 弹窗开启 */
      async function open(data) {
        readme.value = '';
        activeKey.value = 'desc';
        plugin.value = data.plugin;
      }

      /** 弹窗关闭 */
      function close() {
        closeModal();
      }

      async function saveConfig() {
        try {
          setLoading(true);
          await configFormRef.value!.savePluginConfigData();
        } finally {
          setLoading(false);
        }
      }

      /** 设置加载状态*/
      function setLoading(flag) {
        loading.value = flag;
        setModalProps({ confirmLoading: flag });
      }

      let mdTimer: any = null;

      async function getReadme() {
        setLoading(true);
        let timer = setTimeout(() => {
          loadingTip.value = 'github仓库可能会因为网络问题而缓慢，请耐心等待';
        }, 1500);
        try {
          let link = plugin.value!.link;
          if (!link) {
            readme.value = '';
          } else {
            readme.value = await pluginApi.getReadme(plugin.value!.link);
            mdTimer = setTimeout(() => {
              loadingTip.value = 'Markdown编辑器首次使用可能会因为网络原因加载比较慢，请耐心等待';
            }, 1500);
          }
        } finally {
          loadingTip.value = '';
          clearTimeout(timer);
          setLoading(false);
        }
      }

      function onInitOk() {
        clearTimeout(mdTimer);
        loadingTip.value = '';
        initOk.value = true;
      }

      const autoRestart = ref(true);
      const autoNpmInstall = ref(true);

      async function installNow() {
        createConfirm({
          title: '安装插件',
          iconType: 'warning',
          content: () => (
            <div>
              <p>确定要安装该插件吗？</p>
              <Checkbox
                checked={autoRestart.value}
                onChange={(e) => {
                  autoRestart.value = e.target.checked;
                  // 自动重启必须自动安装依赖
                  if (autoRestart.value && !autoNpmInstall.value) {
                    autoNpmInstall.value = true;
                  }
                }}
              >
                自动重启
              </Checkbox>
              <Checkbox
                checked={autoNpmInstall.value}
                onChange={(e) => {
                  if (!e.target.checked && autoRestart.value) {
                    $message.warn('请先去掉自动重启（自动重启必须自动安装依赖）');
                  } else {
                    autoNpmInstall.value = e.target.checked;
                  }
                }}
              >
                自动安装依赖
              </Checkbox>
            </div>
          ),
          async onOk() {
            try {
              setLoading(true);
              let data = await pluginApi.installPlugin(plugin.value!.link, {
                autoRestart: autoRestart.value,
                autoNpmInstall: autoNpmInstall.value,
              });
              if (data.status === 'success') {
                $message.success(data.message);
                if (autoRestart.value) {
                  await sleep(3000);
                  window.location.reload();
                }
              } else {
                $message.error(data.message);
              }
            } finally {
              setLoading(false);
            }
          },
        });
      }

      async function uninstall() {
        createConfirm({
          title: '卸载插件',
          iconType: 'warning',
          content: (
            <div>
              <p>
                确定要卸载该插件吗？
                <br />
                将会删除插件目录包括可能产生的数据以及配置，且无法恢复！
              </p>
              <p>请谨慎操作，卸载后会立即重启！</p>
            </div>
          ),
          async onOk() {
            try {
              setLoading(true);
              let data = await pluginApi.uninstallPlugin(plugin.value!.name);
              if (data.status === 'success') {
                $message.success(data.message);
                await sleep(3000);
                window.location.reload();
              } else {
                $message.error(data.message);
              }
            } finally {
              setLoading(false);
            }
          },
        });
      }

      return {
        configFormRef,
        registerDesc,
        getProps,
        initOk,
        loading,
        loadingTip,
        plugin,
        readme,
        activeKey,
        showConfigForm,

        close,
        saveConfig,
        installNow,
        uninstall,
        onInitOk,
      };
    },
  });
</script>

<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-g-plugin-modal';

  .@{prefix-cls} {
    .ant-modal-body > .scrollbar {
      padding-top: 0;
    }

    .ant-descriptions-item-label {
      width: 100px;
    }
  }
</style>
