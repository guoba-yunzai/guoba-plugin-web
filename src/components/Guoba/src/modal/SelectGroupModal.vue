<template>
  <FormItemRest>
    <BasicModal
      width="800px"
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
            :api="getGroupList"
            :searchInfo="searchInfo"
            :rowSelection="rowSelection"
            :indexColumnProps="indexColumnProps"
            :pagination="paginationProp"
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
  import { defHttp } from '/@/utils/http/axios';
  import { useUserStore } from '/@/store/modules/user';
  import { waitRef } from '/@/utils';
  import { cloneDeep } from 'lodash-es';

  function getGroupList(params) {
    return defHttp.get({ url: '/oicq/group/list', params });
  }

  export default defineComponent({
    name: 'SelectGroupModal',
    components: {
      BasicModal,
      BasicTable,
      FormItemRest,
    },
    props: {
      ...selectModalProps,
      modalTitle: propTypes.string.def('选择群'),
    },
    emits: ['register', 'getSelectResult'],
    setup(props, { emit }) {
      const attrs = useAttrs();
      const tableRef = ref();
      const userStore = useUserStore();
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
      ] = useSelectModal(getGroupList, getBindValue);
      const tableScroll = ref<Recordable>({ x: false });
      //注册弹框
      const [register, { closeModal }] = useModalInner(async () => {
        if (window.innerWidth < 900) {
          tableScroll.value = { x: 900 };
        } else {
          tableScroll.value = { x: false };
        }
        await waitRef(tableRef);
        tableRef.value.setSelectedRowKeys(selectValues['value'] || []);
      });
      const searchInfo = ref(props.params);
      //查询form
      const formConfig: FormProps = {
        // labelWidth: 200,
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
            label: '群号',
            field: 'query_group_id',
            component: 'Input',
            componentProps: { placeholder: '请输入群号' },
          },
          {
            label: '群名称',
            field: 'query_name',
            component: 'Input',
            componentProps: { placeholder: '请输入群名称' },
          },
        ],
        autoSubmitOnEnter: true,
      };
      //定义表格列
      const columns: BasicColumn[] = [
        {
          title: '头像',
          dataIndex: 'group_id',
          width: 60,
          customRender: ({ text }) => <g-avatar id={text} type="group" qs={100} />,
        },
        { title: '群号', dataIndex: 'group_id', width: 120 },
        {
          title: '群名',
          dataIndex: 'group_name',
          ellipsis: true,
          align: 'left',
          customRender({ text, record }) {
            if (record.remark !== text) {
              const isOwner = record.owner_id === userStore.getUserInfo.userId;
              const isAdmin = record.admin_flag;
              const adminText = isOwner ? '（群主）' : isAdmin ? '（管理员）' : '';
              return (
                <span>
                  <span>{text}</span>
                  <span style="color:#999;font-size:8px;">{adminText}</span>
                </span>
              );
            }
            return text;
          },
        },
        {
          title: '活跃人数',
          dataIndex: 'active_member_count',
          width: 80,
          customRender({ text }) {
            return (text ?? 0) + '人';
          },
        },
        {
          title: '总人数',
          dataIndex: 'member_count',
          width: 80,
          customRender({ text }) {
            return (text ?? 0) + '人';
          },
        },
      ];
      //已选择的table信息
      const selectedTable = {
        rowKey: 'group_id',
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
          const ec = (v) => {
            if (typeof v === 'number') {
              // 将中间部分替换成*，保留前后两位
              return v.toString().replace(/(?<=\d{2})\d(?=\d{2})/g, '*');
            } else {
              // 全部替换成*
              return v.toString().replace(/./g, '*');
            }
          };
          console.group('group getSelectResult');
          console.log(
            'options',
            cloneDeep(options).map((v) => ({ label: ec(v.label), value: ec(v.value) })),
          );
          console.log(
            'values',
            cloneDeep(values).map((v) => ec(v)),
          );
          console.log(
            'selectRows',
            cloneDeep(selectRows.value).map((v: any) => ({
              ...v,
              group_id: ec(v.group_id),
              group_name: ec(v.group_name),
              owner_id: ec(v.owner_id),
            })),
          );
          console.groupEnd();
        });
      }

      const paginationProp = ref({
        pageSizeOptions: ['3', '10', '20', '50', '100', '200'],
      });

      return {
        paginationProp,
        handleOk,
        searchInfo,
        register,
        indexColumnProps,
        visibleChange,
        getBindValue,
        getGroupList,
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