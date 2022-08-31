<template>
  <div>
    <GSelectBiz @handleOpen="handleOpen" :loading="btnLoading || loadingEcho" v-bind="attrs" />
    <SelectFriendModal
      :rowKey="rowKey"
      @register="registerModal"
      @getSelectResult="setValue"
      v-bind="getBindValue"
    />
  </div>
</template>
<script lang="ts">
  import type { GSelectBizValues } from './base/types';
  import type { DefaultOptionType } from 'ant-design-vue/es/select';
  import { defineComponent, provide, reactive, ref, unref, watch, watchEffect } from 'vue';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useModal } from '/@/components/Modal';
  import { propTypes } from '/@/utils/propTypes';
  import { useRuleFormItem } from '/@/hooks/component/useFormItem';
  import GSelectBiz from './base/GSelectBiz.vue';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';

  export default defineComponent({
    name: 'GSelectFriend',
    inheritAttrs: false,
    components: {
      GSelectBiz,
      SelectFriendModal: createAsyncComponent(() => import('./modal/SelectFriendModal.vue')),
    },
    props: {
      value: propTypes.array,
      rowKey: propTypes.string.def('user_id'),
      labelKey: propTypes.string.def('nickname'),
      params: propTypes.object.def(() => ({})),
    },
    emits: ['options-change', 'change', 'update:value'],
    setup(props, { emit }) {
      const attrs = useAttrs();
      const emitData = ref<Recordable[]>([]);
      //注册model
      const [regModal, { openModal }] = useModal();
      //表单值
      const [state] = useRuleFormItem(props, 'value', 'change', emitData);
      //下拉框选项值
      const selectOptions = ref<DefaultOptionType[]>([]);
      //下拉框选中值
      const selectValues = reactive<GSelectBizValues>({ value: [], change: false });
      const getBindValue = Object.assign({}, unref(props), unref(attrs));

      const btnLoading = ref<boolean>(true);
      // 是否正在加载回显数据
      const loadingEcho = ref<boolean>(false);
      //下发 selectOptions,xxxBiz组件接收
      provide('selectOptions', selectOptions);
      //下发 selectValues,xxxBiz组件接收
      provide('selectValues', selectValues);
      //下发 loadingEcho,xxxBiz组件接收
      provide('loadingEcho', loadingEcho);

      /**
       * 监听组件值
       */
      watchEffect(() => initValue());

      /**
       * 监听selectValues变化
       */
      watch(selectValues, () => {
        if (selectValues) {
          state.value = selectValues.value;
        }
      });

      function registerModal(...args: any[]) {
        btnLoading.value = false;
        regModal.apply(null, args);
      }

      /**
       * 打开弹出框
       */
      function handleOpen() {
        openModal(true, {
          isUpdate: false,
        });
      }

      /**
       * 将字符串值转化为数组
       */
      function initValue() {
        let value = props.value as Recordable[];
        if (value && value.length > 0) {
          selectValues.value = value;
        } else {
          selectValues.value = [];
        }
      }

      /**
       * 设置下拉框的值
       */
      function setValue(options, values) {
        selectOptions.value = options;
        state.value = values;
        selectValues.value = values;
        emit('update:value', values);
      }

      return {
        state,
        attrs,
        selectOptions,
        getBindValue,
        selectValues,
        btnLoading,
        loadingEcho,
        registerModal,
        setValue,
        handleOpen,
      };
    },
  });
</script>
<style lang="less" scoped>
  .j-select-row {
    @width: 82px;

    .left {
      width: calc(100% - @width - 8px);
    }

    .right {
      width: @width;
    }

    .full {
      width: 100%;
    }

    ::v-deep(.ant-select-search__field) {
      display: none !important;
    }
  }
</style>
