<template>
  <div :class="[`${prefixCls}-card`]">
    <template v-for="schema of schemas">
      <div v-if="schema.component !== 'Divider'" class="card-item">
        <div class="label">{{ schema.label }}</div>
        <div class="value">
          <GSpan :value="models[schema.field]" :password="schema.component === 'InputPassword'" />
        </div>
      </div>
    </template>
    <div v-if="allowRemove" class="remove" @click="onRemove">
      <MinusCircleFilled />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Ref } from 'vue';
  import type { FormSchemas } from '/@/components/Form';
  import { ref, inject } from 'vue';
  import { propTypes } from '/@/utils/propTypes';
  import { SCHEMAS_KEY, PREFIX_CLS_KEY } from '../types';
  import { MinusCircleFilled } from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';

  const props = defineProps({
    models: propTypes.object.def(() => ({})),
    allowRemove: propTypes.bool.def(false),
  });
  const emit = defineEmits(['remove']);

  const prefixCls = inject<string>(PREFIX_CLS_KEY) as string;
  const schemas = inject<Ref<FormSchemas>>(SCHEMAS_KEY, ref([]));

  const { createConfirmSync } = useMessage();

  async function onRemove(e) {
    e.stopPropagation();
    let flag = await createConfirmSync({ title: '删除', content: '确定删除吗？' });
    if (!flag) {
      return;
    }
    emit('remove');
  }
</script>

<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-g-sub-form-card';

  .@{prefix-cls} {
    padding: 10px;
    width: 100%;
    margin: 0 0 10px 0;
    position: relative;
    border-radius: 3px;
    background-color: white;
    cursor: pointer;
    border: 1px transparent solid;
    box-shadow: rgb(0 0 0 / 12%) 0 1px 4px 0, rgb(0 0 0 / 12%) 0 0 2px 0;

    &:hover {
      background-color: #f5f7fa;

      .remove {
        display: block;
      }
    }

    .card-item {
      display: flex;
      flex-direction: row;
      font-size: 12px;
      line-height: 28px;

      .label {
        max-width: 160px;
        color: #9e9e9e;
        padding-right: 1em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .value {
        flex: 1 1 0;
        height: 28px;
        overflow: hidden;
        white-space: nowrap;
      }
    }

    .remove {
      position: absolute;
      top: -10px;
      right: -8px;
      color: #9e9e9e;
      font-size: 18px;
      cursor: pointer;
      display: none;

      &:hover {
        color: #bfbfbf;
      }
    }
  }
</style>