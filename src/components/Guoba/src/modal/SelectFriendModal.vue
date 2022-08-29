<template>
  <FormItemRest>
    <BasicModal
        width="900px"
        :title="modalTitle"
        @ok="handleOk"
        @register="register"
        @visible-change="visibleChange"
        v-bind="$attrs"
    >
      <a-row>
        <a-col :span="showSelected ? 18 : 24">
          <BasicTable
              ref="tableRef"
              :columns="columns"
              :scroll="tableScroll"
              v-bind="getBindValue"
              :useSearchForm="true"
              :formConfig="formConfig"
              :api="getFriendList"
              :searchInfo="searchInfo"
              :rowSelection="rowSelection"
              :indexColumnProps="indexColumnProps"
          >
            <!--            <template #tableTitle></template>-->
          </BasicTable>
        </a-col>
        <a-col v-if="showSelected" :span="6">
          <BasicTable
              v-bind="selectedTable"
              :dataSource="selectRows"
              :useSearchForm="true"
              :formConfig="{ showActionButtonGroup: false, baseRowStyle: { minHeight: '40px' } }"
          >
            <!--操作栏-->
            <template #action="{ record }">
              <a @click="handleDeleteSelected(record)">
                <Icon icon="ant-design:delete-outlined" />
              </a>
            </template>
          </BasicTable>
        </a-col>
      </a-row>
    </BasicModal>
  </FormItemRest>
</template>
<script lang="tsx">
  import type { BasicColumn, FormProps } from '/@/components/Table';
  import { BasicTable } from '/@/components/Table';
  import { defineComponent, ref, unref } from 'vue';
  import { FormItemRest } from 'ant-design-vue/es/form';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { propTypes } from '/@/utils/propTypes';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { selectModalProps, useSelectModal } from '../hooks/useSelectModal';

  //TODO 接口
  async function getFriendList() {
    return {
      records: [
        { name: '牧星长', qq: 1356496272 },
        { name: '槑', qq: 47977659 },
        { name: '三叶', qq: 3523033566 },
      ],
    };
  }

  export default defineComponent({
    name: 'UserSelectModal',
    components: {
      BasicModal,
      BasicTable,
      FormItemRest,
    },
    props: {
      ...selectModalProps,
      modalTitle: propTypes.string.def('选择好友'),
    },
    emits: ['register', 'getSelectResult'],
    setup(props, { emit }) {
      const attrs = useAttrs();
      const tableRef = ref();
      //表格配置
      const config = {
        canResize: false,
        bordered: true,
        size: 'small',
      };
      const getBindValue = Object.assign({}, unref(props), unref(attrs), config);
      const [
        {
          rowSelection,
          visibleChange,
          selectValues,
          indexColumnProps,
          getSelectResult,
          handleDeleteSelected,
          selectRows,
        },
      ] = useSelectModal(getFriendList, getBindValue);
      const tableScroll = ref<Recordable>({ x: false });
      //注册弹框
      const [register, { closeModal }] = useModalInner(() => {
        if (window.innerWidth < 900) {
          tableScroll.value = { x: 900 };
        } else {
          tableScroll.value = { x: false };
        }
        setTimeout(() => {
          if (tableRef.value) {
            tableRef.value.setSelectedRowKeys(selectValues['value'] || []);
          }
        }, 800);
      });
      const searchInfo = ref(props.params);
      //查询form
      const formConfig: FormProps = {
        // labelWidth: 200,
        baseColProps: { xs: 24, sm: 8, md: 6, lg: 8, xl: 8, xxl: 8 },
        actionColOptions: {
          xs: 24, sm: 8, md: 8, lg: 8, xl: 8, xxl: 8,
          style: { paddingLeft: '8px', textAlign: 'left' },
        },
        labelCol: { xs: 24, sm: 6 },
        wrapperCol: { xs: 24, sm: 18 },
        schemas: [
          { label: 'QQ号', field: 'qq', component: 'Input' },
          { label: '昵称', field: 'name', component: 'Input' },
        ],
      };
      //定义表格列
      const columns: BasicColumn[] = [
        {
          title: '头像',
          dataIndex: 'qq',
          width: 60,
          customRender: ({ text }) => <g-avatar id={text} size={100} />,
        },
        { title: 'QQ号', dataIndex: 'qq' },
        { title: '昵称', dataIndex: 'name' },
        { title: '性别', dataIndex: 'sex' },
      ];
      //已选择的table信息
      const selectedTable = {
        rowKey: 'qq',
        size: 'small',
        bordered: true,
        scroll: { y: 390 },
        canResize: false,
        pagination: false,
        showIndexColumn: false,
        columns: [columns[0], { ...columns[1], show: false }, columns[2]],
      };

      /**
       * 确定选择
       */
      function handleOk() {
        getSelectResult((options, values) => {
          //回传选项和已选择的值
          emit('getSelectResult', options, values);
          //关闭弹窗
          closeModal();
        });
      }

      return {
        handleOk,
        searchInfo,
        register,
        indexColumnProps,
        visibleChange,
        getBindValue,
        getFriendList,
        formConfig,
        columns,
        rowSelection,
        selectRows,
        selectedTable,
        handleDeleteSelected,
        tableScroll,
        tableRef,
      };
    },
  });
</script>
