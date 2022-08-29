<template>
  <PageWrapper title="插件管理">
    <template #headerContent>
      插件列表来源：
      <a href="https://gitee.com/Hikari666/Yunzai-Bot-plugins-index" target="_blank">
        Yunzai-Bot插件索引
      </a>
    </template>

    <BasicTable @register="registerTable" :searchInfo="searchInfo">
      <template #action="{ record }">
        <TableAction
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
  </PageWrapper>
</template>
<script lang="ts">
  import { defineComponent, reactive } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { PageWrapper } from '/@/components/Page';

  import { useModal } from '/@/components/Modal';

  import { columns } from './plugins.data';
  import { useGuobaStore } from '/@/store/guoba';

  import GPluginModal from '/@/components/Guoba/src/GPluginModal.vue';

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
          slots: { customRender: 'action' },
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

      return {
        registerTable,
        registerModal,
        handleEdit,
        handleDelete,
        handleSuccess,
        handleView,
        searchInfo,
      };
    },
  });
</script>
