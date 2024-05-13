<template>
  <BasicDrawer v-bind="getProps">
    <a-spin wrapperClassName="p-2" :spinning="loading">
      <div style="margin-bottom: 8px">
        <a-button type="primary" preIcon="ant-design:plus" @click="onAdd">新增备份</a-button>
      </div>
      <a-list size="large" bordered :dataSource="backupList">
        <template #renderItem="{ item }">
          <a-list-item>
            <template #actions>
              <a-popconfirm title="确定要还原吗？" placement="left" @confirm="() => onRollback(item.id)">
                <a-button type="primary" shape="circle" preIcon="ant-design:undo" />
              </a-popconfirm>
              <a-popconfirm title="确定要删除吗？" placement="left" @confirm="() => onDelete(item)">
                <a-button type="primary" shape="circle" danger preIcon="ant-design:delete" />
              </a-popconfirm>
            </template>

            <a-list-item-meta :description="item.time">
              <template #title>
                <span>{{ item.remark }}</span>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-spin>
  </BasicDrawer>
</template>

<script lang="ts">
  import type { DrawerProps } from '/@/components/Drawer';
  import { ref, defineComponent, computed, unref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { usePrompt } from '/@/components/Guoba';
  import { addBackup, deleteBackup, getBackupList, restoreBackup } from '../miao.api';
  import { useMessage } from '/@/hooks/web/useMessage';

  type BackupItem = {
    id: string;
    // 备注
    remark: string;
    // 备份时间
    time: string;
    isInit: boolean;
  };

  export default defineComponent({
    name: 'BackupDrawer',
    components: {
      BasicDrawer,
    },
    emits: ['register', 'reload'],
    setup(props, { emit }) {
      const attrs = useAttrs();
      const { createMessage: $message } = useMessage();
      const { createPrompt } = usePrompt();
      // 当前是否正在加载中
      const loading = ref(false);
      // 是否是更新模式
      const backupList = ref<BackupItem[]>([]);
      // 注册抽屉
      const [registerDrawer, { closeDrawer, setDrawerProps }] = useDrawerInner(open);

      // 抽屉最终props
      const getProps = computed(() => {
        let drawerProps: Partial<DrawerProps> = {
          width: document.body.clientWidth >= 768 ? 700 : '100%',
          title: '喵喵帮助备份',
          confirmLoading: unref(loading),
        };
        let finalProps: Recordable = {
          ...unref(attrs),
          ...drawerProps,
          ...props,
          onOk: close,
          onCancel: close,
          onRegister: registerDrawer,
        };
        return finalProps;
      });

      /** 抽屉开启 */
      function open() {
        loadData();
      }

      async function loadData() {
        try {
          setLoading(true);
          backupList.value = (await getBackupList()).reverse();
        } finally {
          setLoading(false);
        }
      }

      /** 抽屉关闭 */
      function close() {
        closeDrawer();
      }

      function onAdd() {
        createPrompt({
          title: '新增备份',
          required: true,
          placeholder: '请输入备注',
          async onOk(value) {
            await addBackup(value);
            await loadData();
          },
        });
      }

      async function onRollback(id) {
        try {
          setLoading(true);
          await restoreBackup(id);
          emit('reload');
        } finally {
          setLoading(false);
        }
      }

      async function onDelete(item: BackupItem) {
        try {
          if (item.isInit) {
            $message.warn('初始备份不可删除');
            return;
          }
          setLoading(true);
          await deleteBackup(item.id);
          await loadData();
        } finally {
          setLoading(false);
        }
      }

      /** 设置加载状态*/
      function setLoading(flag) {
        loading.value = flag;
        setDrawerProps({ confirmLoading: flag });
      }

      return {
        getProps,
        loading,
        backupList,
        onAdd,
        onRollback,
        onDelete,
      };
    },
  });
</script>

<style scoped lang="less"></style>
