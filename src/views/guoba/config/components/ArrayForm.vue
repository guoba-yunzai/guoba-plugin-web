<template>
  <a-card :title="card.title" :class="[prefixCls]" :bordered="false">
    <template #extra>
      <a-tooltip title="刷新">
        <icon icon="ant-design:redo" style="cursor: pointer" @click="() => emit('redo', form)" />
      </a-tooltip>
    </template>

    <a-spin :spinning="form.loading">
      <div style="color: #333333">
        {{ card.desc }}
      </div>
      <div class="array-box">
        <div class="array-item" v-for="(val, idx) of innerValue">
          <a-input v-model:value="innerValue[idx]" style="max-width: 880px" />
          <a-popconfirm v-if="card.allowDel" title="确定要删除吗？" @confirm="() => onRemove(idx)">
            <a-button
              type="primary"
              pre-icon="ant-design:minus"
              size="small"
              shape="circle"
              danger
            />
          </a-popconfirm>
        </div>
        <a-button
          v-if="card.allowAdd"
          type="link"
          pre-icon="ant-design:plus"
          size="small"
          @click="onAdd"
        >
          <span>{{ addBtnText }}</span>
        </a-button>
      </div>

      <div style="text-align: center">
        <a-button type="primary" pre-icon="ant-design:save" @click="onSubmit">
          <span>保存</span>
        </a-button>
      </div>
    </a-spin>
  </a-card>
</template>

<script lang="ts">
  import type { PropType } from 'vue';
  import { defineComponent, ref, watch, computed } from 'vue';
  import type { IConfigCard, FormType } from '../types';
  import { propTypes } from '/@/utils/propTypes';
  import { BasicForm } from '/@/components/Form';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useMessage } from '/@/hooks/web/useMessage';

  export default defineComponent({
    name: 'ArrayForm',
    components: { BasicForm },
    props: {
      card: propTypes.object.isRequired.type as PropType<IConfigCard>,
      form: propTypes.object.isRequired.type as PropType<FormType>,
      value: propTypes.array.def(() => []),
    },
    emits: ['redo', 'submit'],
    setup(props, { emit }) {
      const { prefixCls } = useDesign('array-form');
      const { createMessage } = useMessage();

      const innerValue = ref<any[]>(props.value);
      const addBtnText = computed(() => props.card?.addBtnText ?? '新增');

      watch(
        () => props.value,
        () => (innerValue.value = props.value),
      );

      function onAdd() {
        let lengthMax = props.card?.lengthMax;
        if (lengthMax != null && innerValue.value.length >= lengthMax) {
          createMessage.warn(`最多只能添加${lengthMax}个`);
          return;
        }
        innerValue.value.push('');
      }

      function onRemove(idx) {
        let lengthMin = props.card?.lengthMin;
        if (lengthMin != null && innerValue.value.length <= lengthMin) {
          createMessage.warn(`至少要留${lengthMin}个`);
          return;
        }
        innerValue.value.splice(idx, 1);
      }

      function onSubmit() {
        if (!props.form?.actions) {
          props.form!.actions = { validate } as any;
        }
        emit('submit', props.form);
      }

      async function validate() {
        return innerValue.value.filter((v) => !(v == null || v == ''));
      }

      return {
        emit,
        prefixCls,
        innerValue,
        addBtnText,
        onAdd,
        onRemove,
        onSubmit,
      };
    },
  });
</script>

<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-array-form';

  .@{prefix-cls} {
    margin-bottom: 12px;

    .array-box {
      margin-bottom: 12px;

      .array-item {
        display: flex;
        margin-top: 8px;
        align-items: center;

        .ant-btn {
          margin-left: 8px;
        }
      }
    }
  }
</style>
