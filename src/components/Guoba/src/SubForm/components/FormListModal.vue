<template>
  <BasicModal v-bind="listModalProps" @register="registerListModal">
    <div style="padding: 10px">
      <a-empty v-if="modelList.length === 0" description="暂无数据，请点击下方的“新增”按钮添加" />

      <template v-for="(models, idx) of modelList">
        <SettingCard :models="models" allowRemove @click="onEdit(models, idx)" />
      </template>
    </div>
    <template #footer>
      <a-row type="flex" justify="space-between">
        <a-col>
          <a-button type="primary" preIcon="ant-design:plus" @click="onAdd">新增</a-button>
        </a-col>
        <a-col>
          <a-button @click="onCancel">关闭</a-button>
        </a-col>
      </a-row>
    </template>
  </BasicModal>
  <SubFormModal :modalProps="modalProps" @register="registerFormModal" @ok="onFormModalOk" />
</template>

<script lang="ts" setup>
  import { computed, inject, ref, PropType } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import SettingCard from './SettingCard.vue';
  import SubFormModal from './SubFormModal.vue';

  const props = defineProps({
    // formModalProps
    modalProps: {
      type: Object as PropType<Recordable>,
      default: () => ({}),
    },
  });
  const emit = defineEmits(['register', 'ok']);

  const modelList = ref<Recordable[]>([]);

  const [registerListModal, listModal] = useModalInner(open);
  const [registerFormModal, formModal] = useModal();

  const listModalProps = computed(() => {
    return {
      title: `填写列表`,
      width: 800,
      onOk: onOk,
    };
  });

  async function open(data) {
    modelList.value = data.list;
  }

  function onAdd() {
    onOpenSingleForm({});
  }

  function onEdit(models, modelIndex: number) {
    onOpenSingleForm(models, {
      modelIndex,
      isUpdate: true,
    });
  }

  async function onOk() {
    emit('ok', modelList.value);
    listModal.closeModal();
  }

  function onCancel() {
    listModal.closeModal();
  }

  function onOpenSingleForm(models: Recordable, payload?) {
    formModal.openModal(true, { models, payload });
  }

  function onFormModalOk({ values, payload: { isUpdate, modelIndex } }) {
    if (isUpdate) {
      modelList.value[modelIndex] = values;
    } else {
      modelList.value.push(values);
    }
  }
</script>

<style scoped lang="scss"></style>