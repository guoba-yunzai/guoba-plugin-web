<template>
  <Modal v-bind="getProps">
    <Spin :spinning="loading">
      <div style="padding: 20px">
        <div v-html="options.content" style="margin-bottom: 8px"></div>
        <BasicForm @register="registerForm">
          <template #customInput="{ model, field }">
            <Input
              ref="inputRef"
              v-model:value="model[field]"
              :placeholder="placeholder"
              @pressEnter="onSubmit"
              @input="onChange"
            />
          </template>
        </BasicForm>
      </div>
    </Spin>
  </Modal>
</template>

<script lang="ts">
  import type { PromptProps } from './typing';
  import type { ModalProps } from '/@/components/Modal';
  import { ref, defineComponent, computed, unref, onMounted, nextTick } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import { Modal, Spin, Input } from 'ant-design-vue';

  export default defineComponent({
    name: 'Prompt',
    components: {
      Modal,
      Spin,
      Input,
      BasicForm,
    },
    emits: ['register'],
    setup(props, { emit }) {
      const inputRef = ref();
      const visible = ref(false);
      // 当前是否正在加载中
      const loading = ref(false);
      const options = ref<PromptProps>({});
      const placeholder = computed(() => options.value.placeholder ?? '请输入内容');
      // 注册表单
      const [registerForm, { clearValidate, setFieldsValue, validate, updateSchema }] = useForm({
        compact: true,
        wrapperCol: { span: 24 },
        schemas: [
          {
            label: '',
            field: 'input',
            component: 'Input',
            slot: 'customInput',
          },
        ],
        showActionButtonGroup: false,
      });

      // 弹窗最终props
      const getProps = computed(() => {
        let opt = options.value;
        let modalProps: Partial<ModalProps> = {
          width: (opt.width ?? 500) as number,
          title: (opt.title ?? 'prompt') as string,
          visible: unref(visible),
          confirmLoading: unref(loading),
          wrapClassName: 'guoba-prompt-modal',
        };
        let finalProps: Recordable = {
          ...modalProps,
          ...props,
          ...opt,
          okText: opt.okText ?? '确定',
          cancelText: opt.cancelText ?? '取消',
          onOk: onSubmit,
          onCancel() {
            if (typeof options.value.onCancel === 'function') {
              options.value.onCancel();
            }
            close();
          },
        };
        return finalProps;
      });

      onMounted(() => {
        emit('register', {
          openModal,
          setLoading,
          getVisible: visible,
        });
      });

      /** 弹窗开启 */
      async function openModal(opt: any) {
        document.body.focus();

        options.value = opt;
        visible.value = true;
        await nextTick();
        await updateSchema({
          field: 'input',
          required: options.value.required,
          rules: options.value.rules,
          dynamicRules: options.value.dynamicRules,
        } as any);
        await setFieldsValue({
          input: options.value.defaultValue ?? '',
        });
        await clearValidate();
        inputRef.value?.focus();
      }

      /** 弹窗关闭 */
      function close() {
        visible.value = false;
      }

      function onChange() {
        validate();
      }

      /** 提交表单 */
      async function onSubmit() {
        try {
          const { onOk } = options.value;
          // 表单验证
          let values = await validate();
          setLoading(true);
          if (typeof onOk === 'function') {
            let flag = await onOk(values.input);
            // 只有返回 false 才阻止关闭弹窗
            if (!(flag === false)) {
              close();
            }
          } else {
            close();
          }
        } finally {
          setLoading(false);
        }
      }

      /** 设置加载状态*/
      function setLoading(flag) {
        loading.value = flag;
      }

      return {
        inputRef,
        getProps,
        loading,
        options,
        placeholder,
        onChange,
        onSubmit,

        registerForm,
      };
    },
  });
</script>
<style lang="less">
  .guoba-prompt-modal {
    .ant-modal {
      &-close-x {
        width: 56px;
      }
      form .ant-col {
        flex: 1;
      }
    }
  }
</style>