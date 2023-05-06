<template>
  <div :class="[prefixCls]">
    <div v-if="multiple" class="multiple-mode" @click="onOpenMultipleForm">
      <a-input ref="inputRef" :value="inputValue" />
    </div>
    <div v-else class="single-mode" @click="onOpenSingleForm">
      <SettingCard :models="singleValue" />
    </div>
    <FormListModal :modalProps="modalProps" @register="registerListModal" @ok="onListModalOk" />
    <SubFormModal :modalProps="modalProps" @register="registerFormModal" @ok="onFormModalOk" />
  </div>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';
  import type { FormSchemas } from '/@/components/Form';
  import { ref, computed, watch, provide, nextTick } from 'vue';
  import { propTypes } from '/@/utils/propTypes';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useModal } from '/@/components/Modal';
  import SettingCard from './components/SettingCard.vue';
  import { SCHEMAS_KEY, PREFIX_CLS_KEY } from './types';
  import SubFormModal from './components/SubFormModal.vue';
  import FormListModal from './components/FormListModal.vue';

  const props = defineProps({
    value: {
      type: [Array, Object],
    },
    schemas: {
      type: Array as PropType<FormSchemas>,
      default: () => [],
    },
    // 允许配置多个
    multiple: propTypes.bool.def(false),
    // 是否返回数组，即使 multiple 设为false，组件返回的数据也会用数组包起来
    alwaysArray: propTypes.bool.def(false),
    // formModalProps
    modalProps: {
      type: Object as PropType<Recordable>,
      default: () => ({}),
    },
  });
  const emit = defineEmits(['change', 'update:value']);
  const { prefixCls } = useDesign('g-sub-form');

  const inputRef = ref();

  const schemasRef = computed(() => props.schemas);
  const getAlwaysArray = computed(() => props.alwaysArray || props.multiple);
  const multipleValue = computed(() => {
    const { value, multiple } = props;
    if (value == null || value.length === 0) {
      return getAlwaysArray.value ? [] : {};
    }
    if (!multiple) {
      if (getAlwaysArray.value && !Array.isArray(value)) {
        return [value];
      }
    } else {
      if (!Array.isArray(value)) {
        return [value];
      }
    }
    return value;
  });
  const singleValue = computed(() => {
    return (
      (Array.isArray(multipleValue.value) ? multipleValue.value[0] : multipleValue.value) ?? {}
    );
  });

  const inputValue = computed(() => {
    const { multiple } = props;
    if (!multiple) {
      return '';
    }
    return `已配置 ${multipleValue.value?.length ?? 0} 项`;
  });

  // 给 input 追加 readonly 属性
  watch(
    inputRef,
    () => {
      const inputNode = inputRef.value?.input as HTMLInputElement;
      if (inputNode) {
        inputNode.setAttribute('readonly', 'readonly');
      }
    },
    { immediate: true },
  );

  const [registerListModal, listModal] = useModal();

  function onOpenMultipleForm() {
    listModal.openModal(true, {
      list: multipleValue.value,
    });
  }

  function onListModalOk(list) {
    emit('change', list);
  }

  const [registerFormModal, formModal] = useModal();

  function onOpenSingleForm() {
    formModal.openModal(true, {
      models: singleValue.value,
    });
  }

  function onFormModalOk({ values }) {
    if (getAlwaysArray.value) {
      values = [values];
    }
    emit('change', values);
  }

  provide(PREFIX_CLS_KEY, prefixCls);
  provide(SCHEMAS_KEY, schemasRef);
</script>

<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-g-sub-form';

  .@{prefix-cls} {
    .multiple-mode {
      &,
      .ant-input {
        cursor: pointer;
      }
    }
  }
</style>