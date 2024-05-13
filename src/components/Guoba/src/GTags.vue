<template>
  <template v-for="tag in tags" :key="tag">
    <a-tooltip v-if="tag.length > 20" :title="tag">
      <a-tag closable @close="handleClose(tag)">
        {{ `${tag.slice(0, 20)}...` }}
      </a-tag>
    </a-tooltip>
    <a-tag v-else closable @close="handleClose(tag)">
      {{ tag }}
    </a-tag>
  </template>
  <a-input v-if="inputVisible" ref="inputRef" v-model:value="inputValue" type="text" size="small" :style="{ width: '78px' }" @blur="handleInputConfirm" @keyup.enter="handleInputConfirm" />
  <a-tag v-else style="background: #fff; border-style: dashed; cursor: pointer" @click="showInput">
    <icon icon="ant-design:plus" />
    新增
  </a-tag>
</template>

<script lang="ts">
  import { defineComponent, ref, watch, reactive, toRefs, nextTick } from 'vue';
  import { propTypes } from '/@/utils/propTypes';
  import { usePrompt } from '/@/components/Guoba';

  export default defineComponent({
    name: 'GTags',
    inheritAttrs: false,
    props: {
      value: propTypes.array.def(() => []),
      // 允许新增
      allowAdd: propTypes.bool.def(false),
      // 允许删除
      allowDel: propTypes.bool.def(false),
      // 是否是弹出输入框
      showPrompt: propTypes.bool.def(false),
      // 弹出配置
      promptProps: propTypes.object.def(() => ({})),
      // 值格式化方法
      valueFormatter: propTypes.oneOfType([propTypes.func, propTypes.string]),
    },
    emits: ['change'],
    setup(props, { emit }) {
      const { createPrompt } = usePrompt();
      const inputRef = ref();

      const state = reactive({
        tags: [] as string[],
        inputVisible: false,
        inputValue: '',
      });

      watch(
        () => props.value,
        (val: Nullable<string[]>) => {
          if (val == null) {
            state.tags = [];
          } else {
            state.tags = val;
          }
        },
        { immediate: true },
      );

      function showInput() {
        if (props.showPrompt) {
          createPrompt({
            title: '添加',
            required: true,
            ...props.promptProps,
            onOk(value) {
              state.inputValue = value;
              handleInputConfirm();
            },
          });
        } else {
          state.inputVisible = true;
          nextTick(() => {
            inputRef.value.focus();
          });
        }
      }

      function handleInputConfirm() {
        const inputValue = state.inputValue;
        let tags = state.tags;
        if (inputValue && tags.indexOf(inputValue) === -1) {
          tags = [...tags, formatter(inputValue)];
        }
        Object.assign(state, {
          tags,
          inputVisible: false,
          inputValue: '',
        });
        onChange();
      }

      function formatter(value) {
        if (props.valueFormatter) {
          if (typeof props.valueFormatter === 'function') {
            props.valueFormatter(value);
          } else {
            return new Function(`return ${props.valueFormatter}`)()(value);
          }
        }
        return value;
      }

      function handleClose(removedTag: string) {
        state.tags = state.tags.filter((tag) => tag !== removedTag);
        onChange();
      }

      function onChange() {
        emit('change', state.tags);
      }

      return {
        ...toRefs(state),
        handleClose,
        showInput,
        handleInputConfirm,
        inputRef,
      };
    },
  });
</script>

<style></style>
