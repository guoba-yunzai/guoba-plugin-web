<template>
  <div>
    <a-row class="g-select-row" type="flex">
      <a-col class="left" :class="{ full: !showButton }">
        <!-- 显示加载效果 -->
        <a-input v-if="loading" readOnly placeholder="加载中…">
          <template #prefix>
            <LoadingOutlined />
          </template>
        </a-input>
        <a-select
            v-else
            ref="select"
            v-model:value="selectValues.value"
            :placeholder="placeholder"
            :mode="multiple"
            :open="false"
            :disabled="disabled"
            :options="options"
            :maxTagCount="maxTagCount"
            @change="handleChange"
            style="width: 100%"
            @click="!disabled && openModal(false)"
            v-bind="attrs"
        ></a-select>
      </a-col>
      <a-col v-if="showButton" class="right">
        <a-button
            type="primary"
            :loading="loading"
            :disabled="disabled"
            @click="openModal(true)"
        >
          <template #icon>
            <SearchOutlined />
          </template>
        </a-button>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
  import type { GSelectBizValues } from '../base/types';
  import type { DefaultOptionType } from 'ant-design-vue/es/select';
  import { defineComponent, inject, reactive, ref } from 'vue';
  import { Button } from 'ant-design-vue';
  import { propTypes } from '/@/utils/propTypes';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { LoadingOutlined, SearchOutlined } from '@ant-design/icons-vue';

  export default defineComponent({
    name: 'GSelectBiz',
    components: { AButton: Button, LoadingOutlined, SearchOutlined },
    inheritAttrs: false,
    props: {
      showButton: propTypes.bool.def(false),
      disabled: propTypes.bool.def(false),
      placeholder: {
        type: String,
        default: '请选择',
      },
      // 是否支持多选，默认 true
      multiple: {
        type: String,
        default: 'multiple',
      },
      // 是否正在加载
      loading: propTypes.bool.def(false),
      // 最多显示多少个 tag
      maxTagCount: propTypes.number,
    },
    emits: ['handleOpen', 'change'],
    setup(_props, { emit }) {
      const attrs = useAttrs();
      //接收下拉框选项
      const options = inject('selectOptions', ref<DefaultOptionType[]>([]));
      //接收选择的值
      const selectValues = inject(
          'selectValues',
          reactive<GSelectBizValues>({ value: [], change: false }),
      );

      /**
       * 打开弹出框
       */
      function openModal() {
        emit('handleOpen');
      }

      /**
       * 下拉框值改变事件
       */
      function handleChange(value) {
        selectValues.value = value;
        // selectValues.change = true;
        emit('change', value);
      }

      return {
        attrs,
        selectValues,
        options,
        handleChange,
        openModal,
      };
    },
  });
</script>
<style lang="less" scoped>
  .g-select-row {
    @width: 32px;

    .left {
      flex: 1;

      //width: calc(100% - @width - 8px);
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
