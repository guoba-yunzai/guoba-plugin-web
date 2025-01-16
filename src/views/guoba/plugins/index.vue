<template>
  <PageWrapper title="插件管理" :loading="loading">
    <template #headerContent>
      插件列表来源：
      <a href="https://gitee.com/yhArcadia/Yunzai-Bot-plugins-index" target="_blank"> Yunzai-Bot插件索引 </a>
    </template>
    <template #footer>
      <a-tabs v-model:activeKey="pluginStatusRef">
        <a-tab-pane :key="1" tab="已安装" />
        <a-tab-pane :key="0" tab="未安装" />
      </a-tabs>
    </template>

    <BasicTable @register="registerTable" :searchInfo="searchInfo" :rowSelection="rowSelection">
      <template #formAdvanceAfter>
        <a-button type="primary" preIcon="ant-design:plus" @click="onInstall">
          <span>安装自定义插件</span>
        </a-button>
      </template>

      <template #bodyCell="{ column, record }">
        <TableAction
          v-if="column.key === 'action'"
          :actions="[
            {
              icon: 'clarity:info-standard-line',
              tooltip: '查看插件详情',
              onClick: handleView.bind(null, record),
            },
          ]"
        />
      </template>
      <template #plugin-title="{ record }">
        <a @click.stop="() => handleView(record)">{{ record.title }}</a>
      </template>
    </BasicTable>
    <GPluginModal @register="registerModal" @success="handleSuccess" />
  </PageWrapper>
</template>

<script lang="tsx" setup>
  import type { Plugins } from '/#/guoba';
  import type { TableRowSelection } from '/@/components/Table';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';

  import { computed, reactive, ref, watch } from 'vue';

  import TableBatchDropdown from './components/TableBatchDropdown.vue';
  import { PageWrapper } from '/@/components/Page';
  import { useModal } from '/@/components/Modal';

  import { columns } from './plugins.data';
  import { useGuobaStore } from '/@/store/guoba';

  import GPluginModal from '/@/components/Guoba/src/GPluginModal.vue';

  import { pluginApi } from '/@/api/guoba';
  import { usePrompt } from '/@/components/Guoba';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { sleep } from '/@/utils/common';

  const guobaStore = useGuobaStore();

  const loading = ref(false);
  // 插件状态，0 = 未安装，1 = 已安装
  const pluginStatusRef = ref(1);

  const allPlugins = ref<Plugins>([]);
  const authorOptions = computed(() => {
    const authors = allPlugins.value.reduce((prev: string[], curr) => {
      let author = curr.author;
      if (!Array.isArray(author)) {
        author = [author];
      }
      author.forEach((item) => {
        if (!prev.includes(item)) {
          prev.push(item);
        }
      });
      return prev;
    }, []);
    return authors.map((item) => {
      // 去掉开头的@
      const label = item.replace(/^@/, '');
      return { label: label, value: item };
    });
  });

  const [registerModal, { openModal }] = useModal();
  const searchInfo = reactive<Recordable>({});

  const rowSelection = reactive<TableRowSelection>({
    type: 'checkbox',
    selectedRowKeys: [],
    onChange: ($selectedRowKeys: string[]) => {
      rowSelection.selectedRowKeys = $selectedRowKeys;
    },
  });

  const [registerTable, { reload, updateTableDataRecord }] = useTable({
    title: () => {
      let text = '',
        showBatch = false;
      if (pluginStatusRef.value === 0) {
        text = '未安装的插件';
      } else {
        if (rowSelection.selectedRowKeys!.length === 0) {
          text = '已安装的插件';
        } else {
          showBatch = true;
          text = `已选中 ${rowSelection.selectedRowKeys!.length} 个插件`;
        }
      }
      return (
        <TableBatchDropdown
          showBatch={showBatch}
          text={text}
          onClear={() => (rowSelection.selectedRowKeys = [])}
          onMenuClick={(e) => {
            switch (e.key) {
              case 'uninstall-batch':
                onUninstallBatch();
                break;
            }
          }}
        />
      );
    },
    api: filterPlugins,
    rowKey: 'name',
    columns,
    useSearchForm: true,
    formConfig: {
      baseColProps: { xs: 24, sm: 8, md: 6, lg: 8, xl: 8, xxl: 8 },
      actionColOptions: {
        xs: 24,
        sm: 8,
        md: 8,
        lg: 8,
        xl: 8,
        xxl: 8,
        style: { paddingLeft: '8px', textAlign: 'left' },
      },
      labelCol: { xs: 24, sm: 6 },
      wrapperCol: { xs: 24, sm: 18 },
      schemas: [
        {
          label: '过滤正则',
          field: 'keywords',
          component: 'Input',
          componentProps: {
            placeholder: '可匹配插件标题、插件名称、插件说明',
            // 回车触发搜索
            onPressEnter: () => reload(),
          },
        },
        {
          label: '插件作者',
          field: 'authors',
          component: 'Select',
          componentProps() {
            return {
              placeholder: '请选择插件作者',
              mode: 'multiple',
              options: authorOptions.value,
              // getPopupContainer: () => document.body,
            };
          },
        },
      ],
    },
    showTableSetting: true,
    bordered: true,
    canResize: false,
    pagination: true,
    indexColumnProps: { title: '#' },
    actionColumn: {
      width: 80,
      title: '操作',
      dataIndex: 'action',
    },
  });

  watch(pluginStatusRef, () => {
    rowSelection.selectedRowKeys = [];
    reload();
  });

  async function filterPlugins(params: Recordable) {
    const plugins = await guobaStore.getPlugins();
    if (!plugins || plugins.length === 0) {
      return [];
    }
    allPlugins.value = plugins;
    let { keywords = '', authors = [] } = params;
    if (!Array.isArray(authors)) {
      authors = [];
    }
    return plugins.filter((plugin) => {
      let flag = pluginStatusRef.value === 1 ? plugin.installed : !plugin.installed;
      if (!flag) {
        return false;
      }
      if (keywords) {
        const reg = new RegExp(keywords, 'i');
        if (!reg.test(plugin.title) && !reg.test(plugin.name) && !reg.test(plugin.description)) {
          return false;
        }
      }
      if (authors.length > 0) {
        let author = plugin.author;
        if (!Array.isArray(author)) {
          author = [author];
        }
        if (!author.some((item) => authors.includes(item))) {
          return false;
        }
      }
      return true;
    });
  }

  // function handleEdit(record: Recordable) {
  //   openModal(true, { plugin: record });
  // }

  // function handleDelete(record: Recordable) {
  //   console.log(record);
  // }

  function handleSuccess({ isUpdate, values }) {
    if (isUpdate) {
      // 演示不刷新表格直接更新内部数据。
      // 注意：updateTableDataRecord要求表格的rowKey属性为string并且存在于每一行的record的keys中
      const result = updateTableDataRecord(values.id, values);
      console.log(result);
    } else {
      reload();
    }
  }

  function handleView(record: Recordable) {
    openModal(true, { plugin: record });
  }

  const { createPrompt } = usePrompt();
  const { createMessage: $message, createConfirm, createInfoModal } = useMessage();

  async function onInstall() {
    createPrompt({
      title: '安装自定义插件',
      required: true,
      placeholder: '请输入插件 Git 地址',
      bottomHelpMessage: '仅支持安装 Plugin 插件，请自行验证插件是否安全',
      rules: [
        { required: true, message: '请输入插件 Git 地址' },
        { type: 'url', message: '请输入正确的 Git 地址' },
      ],
      okText: '安装',
      async onOk(value) {
        let data = await pluginApi.installPlugin(value);
        if (data.status === 'success') {
          $message.success(data.message);
          await sleep(3000);
          window.location.reload();
        } else {
          $message.error(data.message);
        }
      },
    });
  }

  function onUninstallBatch() {
    createConfirm({
      title: '批量卸载',
      iconType: 'warning',
      content: (
        <div>
          <p>确定要批量卸载以下插件吗？</p>
          <p>
            <ul>
              {rowSelection.selectedRowKeys!.map((name, idx) => (
                <li key={name}>
                  {idx + 1}. {name}
                </li>
              ))}
            </ul>
          </p>
          <p>将会删除插件目录包括可能产生的数据以及配置，且无法恢复！</p>
          <p>请谨慎操作，卸载后会立即重启！</p>
        </div>
      ),
      onOk: async () => {
        try {
          loading.value = true;
          const names = rowSelection.selectedRowKeys!.join(',');
          let data = await pluginApi.uninstallPlugin(names);
          if (data.status === 'success') {
            let msgLines = data.message.split('\n');
            createInfoModal({
              title: '批量卸载完成',
              content: (
                <div>
                  {msgLines.map((line) => (
                    <span>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>
              ),
              async onOk() {
                await sleep(3000);
                window.location.reload();
              },
            });
          } else {
            $message.error(data.message);
          }
        } finally {
          loading.value = false;
        }
      },
    });
  }
</script>

<style scoped>
</style>
