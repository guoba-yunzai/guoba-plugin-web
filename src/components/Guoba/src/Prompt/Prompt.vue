<template>
  <ConfigProvider :locale="getAntdLocale">
    <AppProvider>
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
    </AppProvider>
  </ConfigProvider>
</template>

<script lang="ts">
  import type { PromptProps } from './typing';
  import type { ModalProps } from '/@/components/Modal';
  import type { FormActionType } from '/@/components/Form';
  import { ref, defineComponent, computed, unref, onMounted, nextTick } from 'vue';
  import { useForm } from '/@/components/Form';
  import { Modal, Spin, Input } from 'ant-design-vue';
  import { useLocale } from '/@/locales/useLocale';
  import { ConfigProvider } from 'ant-design-vue';
  import { AppProvider } from '/@/components/Application';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';

  export const BasicForm = createAsyncComponent(
    () => import('/@/components/Form/src/BasicForm.vue'),
    {
      loading: true,
    },
  );

  export default defineComponent({
    name: 'Prompt',
    components: {
      Modal,
      Spin,
      Input,
      BasicForm,
      AppProvider,
      ConfigProvider,
    },
    emits: ['register'],
    setup(props, { emit }) {
      const { getAntdLocale } = useLocale();
      const inputRef = ref();
      const visible = ref(false);
      // 当前是否正在加载中
      const loading = ref(false);
      const options = ref<PromptProps>({});
      const placeholder = computed(() => options.value.placeholder ?? '请输入内容');
      // 注册表单
      const [registerFormOrigin, formActions] = useForm({
        compact: true,
        wrapperCol: { span: 24 },
        schemas: computed(() => {
          return [
            {
              label: '',
              field: 'input',
              component: 'Input',
              slot: 'customInput',
              bottomHelpMessage: options.value.bottomHelpMessage,
            },
          ];
        }),
        showActionButtonGroup: false,
      });
      const { clearValidate, setFieldsValue, validate, updateSchema } = formActions;

      let waitFormResolve: any = null;
      let waitForm = new Promise((resolve) => (waitFormResolve = resolve));

      const registerForm = (formActions: FormActionType) => {
        registerFormOrigin(formActions);
        waitFormResolve && waitFormResolve();
      };

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
        await waitForm;
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
        getAntdLocale,
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
