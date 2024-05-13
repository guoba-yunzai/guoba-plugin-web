<template>
  <PageWrapper title="插件管理">
    <template #headerContent>
      插件列表来源：
      <a href="https://gitee.com/yhArcadia/Yunzai-Bot-plugins-index" target="_blank">
        Yunzai-Bot插件索引
      </a>
    </template>

    <BasicTable @register="registerTable" :searchInfo="searchInfo">
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
    </BasicTable>
    <GPluginModal @register="registerModal" @success="handleSuccess" />

    <a-button type="primary" shape="circle" icon="+" class="float-button" @click="install"></a-button>
  </PageWrapper>
</template>

<style scoped>
.float-button {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  z-index: 1000;
}
</style>
<script lang="ts">
  import { defineComponent, reactive } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { PageWrapper } from '/@/components/Page';

  import { useModal } from '/@/components/Modal';

  import { columns } from './plugins.data';
  import { useGuobaStore } from '/@/store/guoba';

  import GPluginModal from '/@/components/Guoba/src/GPluginModal.vue';

  import { pluginApi } from '/@/api/guoba';
  import { usePrompt } from '/@/components/Guoba';
  import { useMessage } from '/@/hooks/web/useMessage';

  export default defineComponent({
    name: 'Plugins',
    components: { BasicTable, PageWrapper, GPluginModal, TableAction },
    setup() {
      const guobaStore = useGuobaStore();
      const [registerModal, { openModal }] = useModal();
      const searchInfo = reactive<Recordable>({});
      const [registerTable, { reload, updateTableDataRecord }] = useTable({
        title: '插件列表',
        api: () => guobaStore.getPlugins(),
        rowKey: 'id',
        columns,
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

      function handleEdit(record: Recordable) {
        openModal(true, { plugin: record });
      }

      function handleDelete(record: Recordable) {
        console.log(record);
      }

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

      async function install() {
        const { createPrompt } = usePrompt();
        const { createMessage: $message } = useMessage();
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
            let data = await pluginApi.installPlugin(value)
            if (data.status === 'success') {
              $message.success(data.message);
              setTimeout(() => {}, 3000);
              window.location.reload();
            } else {
              $message.error(data.message);
            }
          },
        });
      }

      return {
        registerTable,
        registerModal,
        handleEdit,
        handleDelete,
        handleSuccess,
        handleView,
        searchInfo,
        install,
      };
    },
  });
</script>