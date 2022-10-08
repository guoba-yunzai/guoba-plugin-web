<template>
  <BasicModal v-bind="getProps" destroyOnClose>
    <a-spin wrapperClassName="p-2" :spinning="loading">
      <BasicForm @register="registerForm" />
    </a-spin>
  </BasicModal>
</template>

<script lang="ts" setup>
  import type { ModalProps } from '/@/components/Modal';
  import { ref, computed, unref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { cloneDeep } from 'lodash-es';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { saveThemeConfig } from '../miao.api';
  import { useThemeConfigSchemas } from '../miao.data';

  const props = defineProps({});
  const emit = defineEmits(['register', 'success']);

  const attrs = useAttrs();
  const { createMessage: $message } = useMessage();
  // 当前是否正在加载中
  const loading = ref(false);
  // 表单model
  const model = ref<Recordable>();
  const themeName = ref<string>();
  // 注册弹窗
  const [registerModal, { closeModal, setModalProps }] = useModalInner(open);
  // 注册表单
  let schemas = useThemeConfigSchemas();
  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    schemas: schemas,
    labelWidth: 120,
    labelAlign: 'right',
    labelCol: { xs: 24, sm: 5 },
    wrapperCol: { xs: 24, sm: 19 },
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
  });

  // 弹窗最终props
  const getProps = computed(() => {
    let modalProps: Partial<ModalProps> = {
      width: 600,
      title: `编辑皮肤（${themeName.value}）`,
      confirmLoading: unref(loading),
    };
    let finalProps: Recordable = {
      ...unref(attrs),
      ...modalProps,
      ...props,
      onOk: onSubmit,
      onCancel: close,
      onRegister: registerModal,
    };
    return finalProps;
  });

  /** 弹窗开启 */
  async function open(item) {
    // 重置表单
    await resetFields();
    themeName.value = item.name;
    model.value = cloneDeep(item?.style);
    await setFieldsValue({ ...model.value });
  }

  /** 弹窗关闭 */
  function close() {
    closeModal();
  }

  /** 提交表单 */
  async function onSubmit() {
    try {
      // 表单验证
      let values = await validate();
      let formData = Object.assign({}, model.value, values);
      setLoading(true);
      // 提交表单
      await saveThemeConfig(themeName.value!, formData);
      $message.success('保存成功~');
      close();
      emit('success');
    } finally {
      setLoading(false);
    }
  }

  /** 设置加载状态*/
  function setLoading(flag) {
    loading.value = flag;
    setModalProps({ confirmLoading: flag });
  }
</script>

<style lang="less"></style>
