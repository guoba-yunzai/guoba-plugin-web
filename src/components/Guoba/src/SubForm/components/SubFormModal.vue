<template>
  <BasicModal v-bind="formModalProps" @register="registerFormModal">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import type { Ref } from 'vue';
  import { computed, inject, ref, PropType } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchemas } from '/@/components/Form';
  import { SCHEMAS_KEY } from '../types';

  const props = defineProps({
    // formModalProps
    modalProps: {
      type: Object as PropType<Recordable>,
      default: () => ({}),
    },
  });
  const emit = defineEmits(['register', 'ok']);
  const schemasRef = inject<Ref<FormSchemas>>(SCHEMAS_KEY, ref([]));

  const payload = ref<any>(null);

  const [registerFormModal, formModal] = useModalInner(open);
  const [registerForm, formRef] = useForm({
    labelWidth: 120,
    schemas: schemasRef,
    labelAlign: 'right',
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
  });

  const formModalProps = computed(() => {
    return {
      title: '子表单',
      width: 800,
      minHeight: 100,
      onOk: onOk,
      ...props.modalProps,
    };
  });

  async function open(data) {
    payload.value = data.payload;
    await formRef.resetFields();
    await formRef.setFieldsValue(data.models);
  }

  async function onOk() {
    let values = await formRef.validate();
    emit('ok', { values, payload: payload.value });
    formModal.closeModal();
  }
</script>

<style scoped lang="scss"></style>
