<template>
  <div :class="`${prefixCls}`">
    <a-form-item-rest>
      <template v-for="(_, i) of values">
        <a-row :class="['input-row', { 'multiple-mode': multiple }]" type="flex">
          <a-col class="left">
            <EasyCronInputCell v-model:value="values[i]" v-bind="cellProps" @open="() => showModal(i)" style="width: 100%" />
          </a-col>
          <a-col class="right">
            <a-button v-if="multiple" preIcon="ant-design:minus" @click="onRemove(i)" />
          </a-col>
        </a-row>
      </template>
      <a-button v-if="multiple" preIcon="ant-design:plus" type="link" @click="onAdd">添加</a-button>
      <EasyCronModal @register="registerModal" v-model:value="modalValue" :exeStartTime="exeStartTime" :hideYear="hideYear" :remote="remote" :hideSecond="hideSecond" @ok="onModalOk" />
    </a-form-item-rest>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useModal } from '/@/components/Modal';
  import { propTypes } from '/@/utils/propTypes';
  import EasyCronModal from './EasyCronModal.vue';
  import { cronEmits, cronProps } from './easy.cron.data';
  import EasyCronInputCell from './EasyCronInputCell.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import CronParser from 'cron-parser';

  const { createConfirm, createMessage: $message } = useMessage();
  const { prefixCls } = useDesign('easy-cron-input');
  const emit = defineEmits([...cronEmits]);
  const props = defineProps({
    ...cronProps,
    placeholder: propTypes.string.def('请输入cron表达式'),
    exeStartTime: propTypes.oneOfType([propTypes.number, propTypes.string, propTypes.object]).def(0),
  });
  const [registerModal, { openModal }] = useModal();

  const values = ref<string[]>([]);

  watch(
    () => props.value,
    (newVal) => {
      if (!newVal) {
        values.value = [];
      } else if (Array.isArray(newVal)) {
        values.value = newVal;
      } else {
        values.value = [newVal];
      }
      if (values.value.length === 0 && !props.multiple) {
        onAdd();
      }
    },
    { immediate: true },
  );

  watch(
    values,
    (newVal) => {
      let val: any = newVal;
      if (!props.multiple) {
        val = newVal[0];
      }
      if (!val) {
        val = '';
      }
      emit('change', val);
      emit('update:value', val);
    },
    { deep: true },
  );

  const cellProps = computed(() => {
    return {
      placeholder: props.placeholder,
      disabled: props.disabled,
    };
  });

  function onAdd() {
    values.value.push('');
  }

  function onRemove(i: number) {
    createConfirm({
      title: '删除',
      iconType: 'warning',
      content: '确定要删除？',
      onOk: () => {
        values.value.splice(i, 1);
      },
    });
  }

  const modalValue = ref('');
  const modalIndex = ref(-1);

  function showModal(i: number) {
    if (!props.disabled) {
      const val = values.value[i];
      // 检查Cron表达式
      if (val) {
        try {
          const { errors } = CronParser.parseString(val);
          if (errors && Object.keys(errors).length > 0) {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error();
          }
        } catch (e) {
          $message.warn('Cron表达式不正确');
          return;
        }
      }
      modalValue.value = val;
      modalIndex.value = i;
      openModal();
    }
  }

  function onModalOk() {
    values.value[modalIndex.value] = modalValue.value;
  }
</script>

<style lang="less">
  @import 'easy.cron.input';
</style>
