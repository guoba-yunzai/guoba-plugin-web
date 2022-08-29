<template>
  <BasicModal v-bind="getProps">
    <a-spin :spinning="loading || (activeKey === 'readme' && !initOk)" :tip="loadingTip">
      <a-empty v-if="!plugin" description="插件加载失败" />
      <a-tabs v-else v-model:active-key="activeKey">
        <a-tab-pane tab="详情" key="desc">
          <Description @register="registerDesc" :data="plugin" />
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
          <a-button v-if="!plugin?.installed" type="primary" @click="installNow">立即安装</a-button>
          <a-button v-else type="primary" danger @click="installNow">卸载</a-button>
        </a-col>
        <a-col>
          <a-button @click="close">关闭</a-button>
        </a-col>
      </a-row>
    </template>
  </BasicModal>
</template>

<script lang="tsx">
  import type { Plugin } from '/#/guoba';
  import type { ModalProps } from '/@/components/Modal';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref, defineComponent, computed, unref, watch, VNode } from 'vue';
  import { Description, useDescription } from '/@/components/Description';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useDesign } from '/@/hooks/web/useDesign';
  import Scrollbar from '/@/components/Scrollbar/src/Scrollbar.vue';
  import { pluginApi } from '/@/api/guoba';
  import { MarkdownViewer } from '/@/components/Markdown';
  import { useMessage } from '/@/hooks/web/useMessage';

  export default defineComponent({
    name: 'GPluginModal',
    components: {
      Scrollbar,
      BasicModal,
      Description,
      MarkdownViewer,
    },
    emits: ['register', 'success'],
    setup(props) {
      const attrs = useAttrs();
      const { prefixCls } = useDesign('g-plugin-modal');
      const { createMessage: $message } = useMessage();
      // 当前是否正在加载中
      const loading = ref(false);
      const loadingTip = ref('');
      const initOk = ref(false);
      const activeKey = ref('desc');
      const plugin = ref<Plugin>();
      const readme = ref('');
      // 注册弹窗
      const [registerModal, { closeModal, setModalProps }] = useModalInner(open);
      // 注册表单
      const [registerDesc, {}] = useDescription({
        column: 1,
        schema: [
          { label: '插件标题', field: 'title' },
          { label: '插件名称', field: 'name' },
          {
            label: '插件作者', field: 'author',
            render: (_, record) => {
              if (record.authorLink) {
                return <a href={record.authorLink} target="_blank">{record.author}</a>;
              } else {
                return record.author;
              }
            },
          },
          {
            label: '插件链接',
            field: 'link',
            render: val => <a href={val} target="_blank">{val}</a>,
          },
          { label: '插件说明', field: 'description' },
          {
            label: '状态',
            field: 'installed',
            render: (_, record) => {
              let status: VNode[] = [];
              if (record.installed) {
                status.push(<a-tag color="green">已安装</a-tag>);
              } else {
                status.push(<a-tag>未安装</a-tag>);
              }
              if (record.isV3) {
                status.push(<a-tag color="blue">V3</a-tag>);
              }
              if (record.isDeleted) {
                status.push(<a-tag color="red">已失效</a-tag>);
              }
              return <span>{status}</span>;
            },
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
        if (val === 'readme' && !readme.value) {
          getReadme();
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

      function installNow() {
        $message.warn('该功能暂未开放，敬请期待');
      }

      return {
        registerDesc,
        getProps,
        initOk,
        loading,
        loadingTip,
        plugin,
        readme,
        activeKey,

        close,
        installNow,
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